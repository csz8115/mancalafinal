import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma.js";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    io.on("connection", (socket) => {
      console.log("a user connected");

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });

      // retrieve messages
      socket.on(`hello`, async () => {
        try {
          const messages = await prisma.chat.findMany();
          socket.emit(`hello`, { messages });
        } catch (error) {
          console.error("Error retrieving messages:", error);
          socket.emit("error", { message: "Failed to retrieve messages" });
        }
      });

      // update client with new message
      socket.on(`message`, async (data) => {
        try {
          io.emit(`message`, data);
        } catch (error) {
          console.error("Error sending message:", error);
        }
      });

      socket.on(`create-room`, async (lobbyName) => {
        try {
          socket.join(lobbyName);

          // Create game in DB if it doesn't exist
          let game = await prisma.game.findUnique({ where: { lobbyName } });

          // Emit game-start with "waiting" status
          io.to(lobbyName).emit(`game-start`, game);
          console.log(`Room created and broadcast: ${lobbyName}`);
        } catch (error) {
          console.error("Error creating room:", error);
          socket.emit("error", { message: "Failed to create room" });
        }
      });

      socket.on(`join-room`, async (lobbyName, playerID) => {
        try {
          socket.join(lobbyName);
          const game = await prisma.game.findUnique({
            where: { lobbyName },
          });
          io.to(lobbyName).emit(`game-start`, game);
          console.log(`User joined room: ${lobbyName}`);
        } catch (error) {
          console.error("Error joining room:", error);
          socket.emit("error", { message: "Failed to join room" });
        }
      });

      socket.on(`leave-room`, async (lobbyName) => {
        try {
          socket.leave(lobbyName);
          console.log(`User left room: ${lobbyName}`);
        } catch (error) {
          console.error("Error leaving room:", error);
        }
      });

      socket.on(`get-rooms`, async () => {
        try {
          const rooms = await prisma.game.findMany({
            where: { status: "waiting" },
          });
          socket.emit(`rooms-list`, rooms);
        } catch (error) {
          console.error("Error getting rooms:", error);
          socket.emit("error", { message: "Failed to get rooms" });
        }
      });

      const isValidMove = (pitIndex, board, isPlayer1Turn) => {
        if (pitIndex < 0 || pitIndex > 13 || pitIndex === 6 || pitIndex === 13) return false;
        if (isPlayer1Turn && (pitIndex < 0 || pitIndex > 5)) return false;
        if (!isPlayer1Turn && (pitIndex < 7 || pitIndex > 12)) return false;
        return board[pitIndex] !== 0;
      };

      const distributeSeeds = (board, pitIndex, isPlayer1Turn) => {
        let seeds = board[pitIndex];
        board[pitIndex] = 0;
        let currentPit = pitIndex;

        while (seeds > 0) {
          currentPit = (currentPit + 1) % 14;
          if ((isPlayer1Turn && currentPit === 13) || (!isPlayer1Turn && currentPit === 6)) {
            continue;
          }
          board[currentPit]++;
          seeds--;
        }
        return currentPit;
      };

      const handleCapture = (board, lastPit, isPlayer1Turn) => {
        const isOwnSide = isPlayer1Turn
          ? lastPit >= 0 && lastPit <= 5
          : lastPit >= 7 && lastPit <= 12;

        if (board[lastPit] === 1 && isOwnSide) {
          const oppositePit = 12 - lastPit;
          const storeIndex = isPlayer1Turn ? 6 : 13;
          board[storeIndex] += board[oppositePit] + board[lastPit];
          board[oppositePit] = 0;
          board[lastPit] = 0;
        }
      };

      const checkGameOver = (board) => {
        const player1Side = board.slice(0, 6).reduce((sum, s) => sum + s, 0);
        const player2Side = board.slice(7, 13).reduce((sum, s) => sum + s, 0);

        if (player1Side === 0 || player2Side === 0) {
          board[6] += player1Side;
          board[13] += player2Side;
          board.fill(0, 0, 6);
          board.fill(0, 7, 13);
          
          if (board[6] > board[13]) return "player1";
          if (board[13] > board[6]) return "player2";
          return "tie";
        }
        return "";
      };

      const getNextPlayer = (lastPit, isPlayer1Turn, currentPlayer) => {
        const landedInOwnStore = (lastPit === 6 && isPlayer1Turn) || (lastPit === 13 && !isPlayer1Turn);
        if (landedInOwnStore) return currentPlayer;
        return isPlayer1Turn ? "player2" : "player1";
      };

      socket.on(`player-move`, async (data) => {
        try {
          const { game, lobbyName, pitIndex } = data;
          let board = game.board || [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
          let currentPlayer = game.current || "player1";

          const isPlayer1Turn = currentPlayer === "player1";

          if (!isValidMove(pitIndex, board, isPlayer1Turn)) {
            socket.emit("error", { message: "Invalid move" });
            return;
          }

          const lastPit = distributeSeeds(board, pitIndex, isPlayer1Turn);
          handleCapture(board, lastPit, isPlayer1Turn);
          const winner = checkGameOver(board);
          const nextPlayer = getNextPlayer(lastPit, isPlayer1Turn, currentPlayer);

          const updatedGame = await prisma.game.update({
            where: { lobbyName },
            data: {
              board,
              current: nextPlayer,
              winner: winner || "",
              status: winner ? "complete" : "inProgress",
            },
          });

          io.to(lobbyName).emit(`game-update`, updatedGame);

          if (updatedGame.winner) {
            io.to(lobbyName).emit(`game-over`, updatedGame);
          }
        } catch (error) {
          console.error("Error handling player move:", error);
          socket.emit("error", { message: "Failed to process move" });
        }
      });
    });

    httpServer
      .once("error", (err) => {
        console.error(err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
      });
  })
  .catch((error) => {
    console.error("Failed to prepare Next.js app:", error);
    process.exit(1);
  });
