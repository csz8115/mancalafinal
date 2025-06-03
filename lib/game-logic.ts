export const isValidMove = (pitIndex: any, board: any, isPlayer1Turn: any) => {
    if (pitIndex < 0 || pitIndex > 13 || pitIndex === 6 || pitIndex === 13) return false;
    if (isPlayer1Turn && (pitIndex < 0 || pitIndex > 5)) return false;
    if (!isPlayer1Turn && (pitIndex < 7 || pitIndex > 12)) return false;
    return board[pitIndex] !== 0;
};

export const distributeSeeds = (board: any, pitIndex: any, isPlayer1Turn: any) => {
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

export const handleCapture = (board: any, lastPit: any, isPlayer1Turn: any) => {
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

export const checkGameOver = (board: any) => {
    const player1Side = board.slice(0, 6).reduce((sum: any, s: any) => sum + s, 0);
    const player2Side = board.slice(7, 13).reduce((sum: any, s: any) => sum + s, 0);

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

export const getNextPlayer = (lastPit: any, isPlayer1Turn: any, currentPlayer: any) => {
    const landedInOwnStore = (lastPit === 6 && isPlayer1Turn) || (lastPit === 13 && !isPlayer1Turn);
    if (landedInOwnStore) return currentPlayer;
    return isPlayer1Turn ? "player2" : "player1";
};

