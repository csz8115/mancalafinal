import { createServer } from "http";
import { Server } from "socket.io";
import db from "./lib/db"; // Ensure this is the correct path to your db.js file
import next from "next";
import { logger } from "./lib/logger";
import { isValidMove, distributeSeeds, handleCapture, checkGameOver, getNextPlayer } from "./lib/game-logic"; // Adjust the import path as necessary

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
      logger.info("User connected");
      socket.on("disconnect", () => {
        logger.info("User disconnected");
      });

      // retrieve messages
      socket.on(`hello`, async () => {
        try {
          const messages = await db.getMessages();
          socket.emit(`hello`, { messages });
        } catch (error) {
          logger.error("Error retrieving messages:", error);
          socket.emit("error", { message: "Failed to retrieve messages" });
        }
      });

      // update client with new message
      socket.on(`message`, async (data) => {
        try {
          io.emit(`message`, data);
        } catch (error) {
          logger.error("Error sending message:", error);
        }
      });

      socket.on(`create-room`, async (lobbyName) => {
        try {
          socket.join(lobbyName);
          const game = await db.getGameByLobbyName(lobbyName);


          io.to(lobbyName).emit(`game-start`, game);
          logger.info(`User created room: ${lobbyName}`);
        } catch (error) {
          logger.error("Error creating room:", error);
          socket.emit("error", { message: "Failed to create room" });
        }
      });

      socket.on(`join-room`, async (lobbyName) => {
        try {
          socket.join(lobbyName);
          const game = await db.getGameByLobbyName(lobbyName);

          io.to(lobbyName).emit(`game-start`, game);
          console.log(`User joined room: ${lobbyName}`);
        } catch (error) {
          logger.error("Error joining room:", error);
          socket.emit("error", { message: "Failed to join room" });
        }
      });

      socket.on(`leave-room`, async (lobbyName) => {
        try {
          socket.leave(lobbyName);
          console.log(`User left room: ${lobbyName}`);
        } catch (error) {
          logger.error("Error leaving room:", error);
        }
      });

      socket.on(`get-rooms`, async () => {
        try {
          const rooms = await db.getAvailableGames();
          socket.emit(`rooms-list`, rooms);
        } catch (error) {
          logger.error("Error getting rooms:", error);
          socket.emit("error", { message: "Failed to get rooms" });
        }
      });

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
          logger.info(`Player ${currentPlayer} moved from pit ${pitIndex}. Last pit: ${lastPit}, Winner: ${winner}`);
          let winnerId = "";
          if (winner) {
            winnerId = winner === "player1" ? game.player1 : winner === "player2" ? game.player2 : winner === "tie" ? "tie" : "";
          }
          const nextPlayer = getNextPlayer(lastPit, isPlayer1Turn, currentPlayer);
          const gameStatus = winner ? "complete" : "inProgress";

          const updatedGame = await db.gameMove(lobbyName, board, nextPlayer, winnerId, gameStatus);
          io.to(lobbyName).emit(`game-update`, updatedGame);

          if (gameStatus === "complete") {
            logger.info(`Game over in room ${lobbyName}. Winner: ${winnerId}`);
            const CompletedGame = await db.getGameByLobbyName(lobbyName)
            io.to(lobbyName).emit(`game-over`, CompletedGame);
          }
        } catch (error) {
          logger.error("Error processing player move:", error);
          socket.emit("error", { message: "Failed to process move" });
        }
      });
    });

    httpServer
      .once("error", (err) => {
        logger.error("Server error:", err);
        process.exit(1);
      })
      .listen(port, () => {
        logger.info(`> Ready on http://${hostname}:${port}`);
      });
  })
  .catch((error) => {
    logger.error("Error during app preparation:", error);
    process.exit(1);
  });
