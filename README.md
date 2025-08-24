# 🕹️ Mancala Multiplayer Game

This is a real-time multiplayer **Mancala** game built with [Next.js](https://nextjs.org), [Socket.IO](https://socket.io/), [Prisma](https://www.prisma.io/), and [MongoDB Atlas](https://www.mongodb.com/atlas). The app supports interactive gameplay, persistent user sessions, and live game state updates.

> **Note**: The WebSocket server is hosted separately. You can find its repository here: [mancalaSocket](https://github.com/csz8115/mancalaSocket)

🔗 [[https://mancala-three.vercel.app/login](https://mancala-three.vercel.app/login](https://github.com/csz8115/mancalaSocket)

## 🚀 Getting Started

You can try the live production version here:  
🔗 [https://mancala-three.vercel.app/login](https://mancala-three.vercel.app/login)

## Overview

This is a fullstack application with an emphasis on real time systems and scalable system architecture.
The application has a split deployment on vercerl and render.
-Frontend & API Layer (Next.js on Vercel): Handles authentication, and session management.
-WebSocket Server (Render): Powers live gameplay and chat features using Socket.IO, overcoming edge-function limitations of Vercel hosting.
-Data Layer (MongoDB Atlas + Prisma ORM): Provides a high availability, cloud database for user accounts, game history, and real-time statistics, with Prisma and Zod ensuring type-safe queries and schema management.

## Tech Stack 

### Frameworks & Core Libaries
- NextJS (React, Typescript, Hooks)
- Socket.io (Real-Time Communication)
- Prisma ORM (MongoDB Schema & Queries)
- TailwindCSS & ShadCN (UI)

### Databases
- MongoDB Atlas (cloud database)
- Redis (Caching and active session tracking)

### Deployment
- Vercel (NextJS app deployment)
- Render (Socket.io app deployment)

## Database Structure

This system uses Prisma ORM to build a schema defining schemas and relationships.

### Models

User → Authentication details, stats, and session info.
Game → Stores game states, results, and timestamps.
Chat → Stores real-time chat messages.

erDiagram
    USER ||--o{ GAME : "as player1"
    USER ||--o{ GAME : "as player2"
    USER ||--o{ CHAT : "writes"
    GAME o|--o{ CHAT : "messages (optional link)"

    USER {
      ObjectId id PK
      string   username  "unique"
      string   password
      datetime createdAt
      datetime lastLogin  "nullable"
      string   url        "nullable"
      int      gamesPlayed
      int      gamesWon
      int      gamesLost
      int      gamesDrawn
    }

    GAME {
      ObjectId id PK
      string   lobbyName  "unique"
      datetime createdAt
      datetime updatedAt  "nullable"
      int[]    board      "default [4,4,4,4,4,4,0,4,4,4,4,4,4,0]"
      enum     status     "waiting|inProgress|complete"
      enum     current    "player1|player2|bot"
      ObjectId player1 FK
      ObjectId player2 FK "nullable"
      string   winner     "empty if none"
    }

    CHAT {
      ObjectId id PK
      string   username
      datetime createdAt
      datetime updatedAt  "nullable"
      string   message
      ObjectId userId FK
      ObjectId game      "nullable (no Prisma relation)"
      string   url
    }


### Redis Usage

- Tracks active user sessions for reports

