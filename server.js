import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "./utils/prisma.js";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    // retrieve messages
    socket.on(`hello`, async (data) => {
      // get all messages from database
      const messages = await prisma.chat.findMany();

      // send message to client
      socket.emit(`hello`, {
        messages,
      });
    });

    // update client with new message
    socket.on(`message`, async (data) => {
      // send message to all clients
      io.emit(`message`, data);
    });

    // create a new game in the db
    socket.on(`newGame`, async (data) => {
      // send message to all clients
      io.emit(`message`, data);
    });

    // join a game room
    socket.on(`joinGame`, async (data) => {
      // send message to all clients
      io.emit(`message`, data);
    });

    // exit a game room 
    socket.on(`exitGame`, async (data) => {
      // send message to all clients
      io.emit(`message`, data);
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
});
