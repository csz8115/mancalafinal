# 🕹️ Mancala Multiplayer Game

This is a real-time multiplayer **Mancala** game built with [Next.js](https://nextjs.org), [Socket.IO](https://socket.io/), [Prisma](https://www.prisma.io/), and [MongoDB Atlas](https://www.mongodb.com/atlas). The app supports interactive gameplay, persistent user sessions, and live game state updates.

> **Note**: The WebSocket server is hosted separately. You can find its repository here: [mancalaSocket](https://github.com/csz8115/mancalaSocket)

🔗 [[https://mancala-three.vercel.app/login](https://mancala-three.vercel.app/login](https://github.com/csz8115/mancalaSocket)

## 🚀 Getting Started

You can try the live production version here:  
🔗 [https://mancala-three.vercel.app/login](https://mancala-three.vercel.app/login)

## Brief Description 

This application was built using Nextjs, MongoDB, MongoDB Atlas Cloud services, and Prisma as a ORM for MongoDB. I deployed the application in two parts, the Nextjs application is hosted on vercel, whereas the socket server is hosted on render. This is due to the limitations associated with vercel hosting and the edge functionalities used by the Nextjs framework. Users can create a new account, login to the site, access a real time messaging feature created with web sockets. Additionally players can play multiplayer mancala with real time socket updates and real time user statistic updates upon game completion.

## Tech Stack 

### Frameworks
NextJS
Socket.io 
TailwindCSS
Typescript 
MongoDB 
PrismaORM

### Deployment
Vercel
Render
