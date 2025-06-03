import db from '@/lib/db';
import { prisma } from '@/lib/prisma'; // mocked version
import { User } from '@prisma/client';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { mock } from 'node:test';

jest.mock('@/lib/prisma');

describe('Database functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return user from getUser', async () => {
        const mockUser: User = {
            id: '123',
            username: 'testuser',
            password: 'hashed',
            url: 'https://avatar.com/testuser',
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: null,
            gamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            gamesDrawn: 0
        };

        (prisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockUser);

        const user = await db.getUser('testuser');
        expect(user).toEqual(mockUser);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { username: 'testuser' },
        });
    });

    it('should return null if user not found', async () => {
        (prisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);
        const user = await db.getUser('nonexistentuser');
        expect(user).toBeNull();
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { username: 'nonexistentuser' },
        });
    });

    it('should return null on a database error', async () => {
        (prisma.user.findUnique as jest.MockedFunction<any>).mockRejectedValue(new Error('Database error'));
        const user = await db.getUser('erroruser');
        expect(user).toBeNull();
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { username: 'erroruser' },
        });
    });

    it('should create a new user', async () => {
        const newUser = {
            id: '456',
            username: 'newuser',
            password: 'hashed',
            url: 'https://avatar.com/newuser',
            createdAt: new Date(),
            updatedAt: new Date(),
            gamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            gamesDrawn: 0,
            lastLogin: null,
        };

        (prisma.user.create as jest.MockedFunction<any>).mockResolvedValue(newUser);

        const user = await db.createUser('newuser', 'plaintext');
        expect(user).not.toBeNull();
        expect(user!.username).toBe('newuser');
        expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should create a user where username already exists', async () => {
        (prisma.user.create as jest.MockedFunction<any>).mockRejectedValue(new Error('Unique constraint failed'));
        const user = await db.createUser('existinguser', 'plaintext');
        expect(user).toBeNull();
        expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                username: 'existinguser',
            }),
        }));
    });

    it('should create user and return null on database error', async () => {
        (prisma.user.create as jest.MockedFunction<any>).mockRejectedValue(new Error('Database error'));
        const user = await db.createUser('erroruser', 'plaintext');
        expect(user).toBeNull();
        expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                username: 'erroruser',
            }),
        }));
    });

    it('should create a game and connect player1', async () => {
        const mockGame = {
            id: 'game1',
            lobbyName: 'testLobby',
            board: null,
            current: null,
            winner: null,
            status: 'waiting',
            createdAt: new Date(),
            updatedAt: new Date(),
            player1ID: 'player1',
            player2ID: null,
        };

        (prisma.game.create as jest.MockedFunction<any>).mockResolvedValue(mockGame);

        const game = await db.createGame('player1', 'testLobby');
        expect(game).not.toBeNull();
        expect(game!.lobbyName).toBe('testLobby');
        expect(prisma.game.create).toHaveBeenCalled();
    });

    it('should create a game and return null on database error', async () => {
        (prisma.game.create as jest.MockedFunction<any>).mockRejectedValue(new Error('Database error'));
        const game = await db.createGame('player1', 'testLobby');
        expect(game).toBeNull();
        expect(prisma.game.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                lobbyName: 'testLobby',
                player1User: expect.objectContaining({
                    connect: { id: 'player1' },
                }),
            }),
        }));
    });

    it('should create a game where the lobby name already exists', async () => {
        (prisma.game.create as jest.MockedFunction<any>).mockRejectedValue(new Error('Unique constraint failed'));
        const game = await db.createGame('player1', 'existingLobby');
        expect(game).toBeNull();
        expect(prisma.game.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                lobbyName: 'existingLobby',
            }),
        }));
    });

    it('should create a game where the player1ID does not exist', async () => {
        (prisma.game.create as jest.MockedFunction<any>).mockRejectedValue(new Error('Foreign key constraint failed'));
        const game = await db.createGame('nonexistentPlayer', 'testLobby');
        expect(game).toBeNull();
        expect(prisma.game.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                lobbyName: 'testLobby',
                player1User: expect.objectContaining({
                    connect: { id: 'nonexistentPlayer' },
                }),
            }),
        }));
    });
});

it('should join a game and connect player2', async () => {
    const mockGame = {
        id: 'game1',
        lobbyName: 'testLobby',
        board: null,
        current: null,
        winner: null,
        status: 'inProgress',
        createdAt: new Date(),
        updatedAt: new Date(),
        player1ID: 'player1',
        player2ID: 'player2',
    };

    (prisma.game.update as jest.MockedFunction<any>).mockResolvedValue(mockGame);

    const game = await db.joinGame('player2', 'testLobby');
    expect(game).not.toBeNull();
    expect(game!.lobbyName).toBe('testLobby');
    expect(prisma.game.update).toHaveBeenCalled();
});

it('should join a game and return null on database error', async () => {
    (prisma.game.update as jest.MockedFunction<any>).mockRejectedValue(new Error('Database error'));
    const game = await db.joinGame('player2', 'testLobby');
    expect(game).toBeNull();
    expect(prisma.game.update).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
            lobbyName: 'testLobby',
        }),
        data: expect.objectContaining({
            player2User: expect.objectContaining({
                connect: { id: 'player2' },
            }),
            status: 'inProgress',
        }),
    }));
});

it('should join a game where the lobby name does not exist', async () => {
    (prisma.game.update as jest.MockedFunction<any>).mockRejectedValue(new Error('Record not found'));
    const game = await db.joinGame('player2', 'nonexistentLobby');
    expect(game).toBeNull();
    expect(prisma.game.update).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
            lobbyName: 'nonexistentLobby',
        }),
    }));
});

it('should join a game where the player2ID does not exist', async () => {
    (prisma.game.update as jest.MockedFunction<any>).mockRejectedValue(new Error('Foreign key constraint failed'));
    const game = await db.joinGame('nonexistentPlayer', 'testLobby');
    expect(game).toBeNull();
    expect(prisma.game.update).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
            lobbyName: 'testLobby',
        }),
        data: expect.objectContaining({
            player2User: expect.objectContaining({
                connect: { id: 'nonexistentPlayer' },
            }),
        }),
    }));
});

it('should join a game where the player2ID already exists', async () => {
    (prisma.game.update as jest.MockedFunction<any>).mockRejectedValue(new Error('Unique constraint failed'));
    const game = await db.joinGame('existingPlayer', 'testLobby');
    expect(game).toBeNull();
    expect(prisma.game.update).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
            lobbyName: 'testLobby',
        }),
        data: expect.objectContaining({
            player2User: expect.objectContaining({
                connect: { id: 'existingPlayer' },
            }),
        }),
    }));
});

it('should get a game by lobby name', async () => {
    const mockGame = {
        id: 'game1',
        lobbyName: 'testLobby',
        board: null,
        current: null,
        winner: null,
        status: 'waiting',
        createdAt: new Date(),
        updatedAt: new Date(),
        player1ID: 'player1',
        player2ID: null,
    };

    (prisma.game.findUnique as jest.MockedFunction<any>).mockResolvedValue(mockGame);

    const game = await db.getGameByLobbyName('testLobby');
    expect(game).not.toBeNull();
    expect(game!.lobbyName).toBe('testLobby');
    expect(prisma.game.findUnique).toHaveBeenCalledWith({
        where: { lobbyName: 'testLobby' },
    });
});

it('should return null if game not found by lobby name', async () => {
    (prisma.game.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);
    const game = await db.getGameByLobbyName('nonexistentLobby');
    expect(game).toBeNull();
    expect(prisma.game.findUnique).toHaveBeenCalledWith({
        where: { lobbyName: 'nonexistentLobby' },
    });
});

it('should return null on database error when getting game by lobby name', async () => {
    (prisma.game.findUnique as jest.MockedFunction<any>).mockRejectedValue(new Error('Database error'));
    const game = await db.getGameByLobbyName('errorLobby');
    expect(game).toBeNull();
    expect(prisma.game.findUnique).toHaveBeenCalledWith({
        where: { lobbyName: 'errorLobby' },
    });
});

it('should get available games', async () => {
    const mockGames = [
        {
            id: 'game1',
            lobbyName: 'testLobby1',
            board: null,
            current: null,
            winner: null,
            status: 'waiting',
            createdAt: new Date(),
            updatedAt: new Date(),
            player1ID: 'player1',
            player2ID: null,
        },
        {
            id: 'game2',
            lobbyName: 'testLobby2',
            board: null,
            current: null,
            winner: null,
            status: 'waiting',
            createdAt: new Date(),
            updatedAt: new Date(),
            player1ID: 'player2',
            player2ID: null,
        },
    ];

    (prisma.game.findMany as jest.MockedFunction<any>).mockResolvedValue(mockGames);

    const games = await db.getAvailableGames();
    expect(games).toEqual(mockGames);
    expect(prisma.game.findMany).toHaveBeenCalledWith({
        where: { status: 'waiting' },
        orderBy: { createdAt: 'asc' },
    });
});

it('should return an empty array if no available games', async () => {
    (prisma.game.findMany as jest.MockedFunction<any>).mockResolvedValue([]);
    const games = await db.getAvailableGames();
    expect(games).toEqual([]);
    expect(prisma.game.findMany).toHaveBeenCalledWith({
        where: { status: 'waiting' },
        orderBy: { createdAt: 'asc' },
    });
});

it('should return an empty array on database error when getting available games', async () => {
    (prisma.game.findMany as jest.MockedFunction<any>).mockRejectedValue(new Error('Database error'));
    const games = await db.getAvailableGames();
    expect(games).toEqual([]);
    expect(prisma.game.findMany).toHaveBeenCalledWith({
        where: { status: 'waiting' },
        orderBy: { createdAt: 'asc' },
    });
});

it('should update game state on move', async () => {
    const mockGame = {
        id: 'game1',
        lobbyName: 'testLobby',
        board: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0],
        current: 'player1',
        winner: null,
        status: 'inProgress',
        createdAt: new Date(),
        updatedAt: new Date(),
        player1ID: 'player1',
        player2ID: 'player2',
    };

    (prisma.game.update as jest.MockedFunction<any>).mockResolvedValue(mockGame);

    const updatedGame = await db.gameMove('testLobby', mockGame.board, 'player2', "", 'inProgress');
    expect(updatedGame).not.toBeNull();
    expect(updatedGame!.lobbyName).toBe('testLobby');
    expect(prisma.game.update).toHaveBeenCalled();
});

it('should return null on database error when updating game state', async () => {
    (prisma.game.update as jest.MockedFunction<any>).mockRejectedValue(new Error('Database error'));
    const updatedGame = await db.gameMove('testLobby', [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0], 'player2', "", 'inProgress');
    expect(updatedGame).toBeNull();
    expect(prisma.game.update).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
            lobbyName: 'testLobby',
        }),
    }));
});

it('should return null if game not found when updating state', async () => {
    (prisma.game.update as jest.MockedFunction<any>).mockRejectedValue(new Error('Record not found'));
    const updatedGame = await db.gameMove('nonexistentLobby', [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0], 'player2', "", 'inProgress');
    expect(updatedGame).toBeNull();
    expect(prisma.game.update).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
            lobbyName: 'nonexistentLobby',
        }),
    }));
});

it('should return null if game already completed when updating state', async () => {
    (prisma.game.update as jest.MockedFunction<any>).mockRejectedValue(new Error('Game already completed'));
    const updatedGame = await db.gameMove('testLobby', [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0], 'player2', "", 'complete');
    expect(updatedGame).toBeNull();
    expect(prisma.game.update).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
            lobbyName: 'testLobby',
        }),
    }));
});

it('should return null if invalid move when updating state', async () => {
    (prisma.game.update as jest.MockedFunction<any>).mockRejectedValue(new Error('Invalid move'));
    const updatedGame = await db.gameMove('testLobby', [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0], 'player2', "", 'inProgress');
    expect(updatedGame).toBeNull();
    expect(prisma.game.update).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
            lobbyName: 'testLobby',
        }),
    }));
});

it('should create a message in the chat', async () => {
    const mockMessage = {
        id: 'msg1',
        message: 'Hello world!',
        username: 'testuser',
        userId: '123',
        url: 'https://avatar.com/testuser',
        createdAt: new Date(),
    };
    (prisma.chat.create as jest.MockedFunction<any>).mockResolvedValue(mockMessage);
    const message = await db.createMessage("Hello world!", "testuser", "123", 'https://avatar.com/testuser');
    expect(message).toEqual(mockMessage);
    expect(prisma.chat.create).toHaveBeenCalledWith({
        data: {
            message: 'Hello world!',
            username: 'testuser',
            userId: '123',
            url: 'https://avatar.com/testuser',
        },
    });
});

it('should return null if message creation fails', async () => {
    (prisma.chat.create as jest.MockedFunction<any>).mockRejectedValue(new Error('Database error'));
    const message = await db.createMessage("Hello world!", "testuser", "123", 'https://avatar.com/testuser');
    expect(message).toBeNull();
    expect(prisma.chat.create).toHaveBeenCalledWith({
        data: {
            message: 'Hello world!',
            username: 'testuser',
            userId: '123',
            url: 'https://avatar.com/testuser',
        },
    });
});

it('should create a message where the userId does not exist', async () => {
    (prisma.chat.create as jest.MockedFunction<any>).mockRejectedValue(new Error('Foreign key constraint failed'));
    const message = await db.createMessage("Hello world!", "nonexistentUser", "testuser", 'https://avatar.com/testuser');
    expect(message).toBeNull();
    expect(prisma.chat.create).toHaveBeenCalledWith({
        data: {
            message: 'Hello world!',
            username: 'nonexistentUser',
            userId: 'testuser',
            url: 'https://avatar.com/testuser',
        },
    });
});

it('should create a message where the username does not exists', async () => {
    (prisma.chat.create as jest.MockedFunction<any>).mockRejectedValue(new Error('Unique constraint failed'));
    const message = await db.createMessage('Hello world!', "testuser", 'nonexistentUser', 'https://avatar.com/testuser');
    expect(message).toBeNull();
    expect(prisma.chat.create).toHaveBeenCalledWith({
        data: {
            message: 'Hello world!',
            username: 'nonexistentUser',
            userId: 'testuser',
            url: 'https://avatar.com/testuser',
        },
    });
});

it('should create a message where the username and userId do not match', async () => {
    (prisma.chat.create as jest.MockedFunction<any>).mockRejectedValue(new Error('Foreign key constraint failed'));
    const message = await db.createMessage('Hello, world!', "testuser", '123', 'https://avatar.com/anotheruser');
    expect(message).toBeNull();
    expect(prisma.chat.create).toHaveBeenCalledWith({
        data: {
            message: 'Hello, world!',
            username: 'testuser',
            userId: '123',
            url: 'https://avatar.com/anotheruser',
        },
    });
});

it('should get messages from the chat', async () => {
    const mockMessages = [
        {
            id: 'msg1',
            message: 'Hello, world!',
            username: 'testuser',
            userId: '123',
            url: 'https://avatar.com/testuser',
            createdAt: new Date(),
        },
        {
            id: 'msg2',
            message: 'Another message',
            username: 'anotheruser',
            userId: '456',
            url: 'https://avatar.com/anotheruser',
            createdAt: new Date(),
        },
    ];

    (prisma.chat.findMany as jest.MockedFunction<any>).mockResolvedValue(mockMessages);

    const messages = await db.getMessages();
    expect(messages).toEqual(mockMessages);
    expect(prisma.chat.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
    });
});

it('should return an empty array if no messages found', async () => {
    (prisma.chat.findMany as jest.MockedFunction<any>).mockResolvedValue([]);
    const messages = await db.getMessages();
    expect(messages).toEqual([]);
    expect(prisma.chat.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
    });
});

it('should return an empty array on database error when getting messages', async () => {
    (prisma.chat.findMany as jest.MockedFunction<any>).mockRejectedValue(new Error('Database error'));
    const messages = await db.getMessages();
    expect(messages).toEqual([]);
    expect(prisma.chat.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
    });
});