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

### Deployment
- Vercel (NextJS app deployment)
- Render (Socket.io app deployment)

## Database Structure

This system uses Prisma ORM to build a schema defining schemas and relationships.

### Models

- User → Authentication details, stats, and session info.
- Game → Stores game states, results, and timestamps.
- Chat → Stores real-time chat messages.

![Mancala ERD](./src/img/mancala_erd.png)

## Frontend Showcase

- Login/Register Page

- Dashboard

- Game Lobby 

- Game Board

- Player Profile

- Player Stats

## Testing

This project includes a comprehensive testing suite including Unit, Integration, and API level testing
- Unit Tests: Validate game logic, board state transitions, and helper functions.
- Integration Tests: Simulate player actions across WebSocket events and ensure consistent game outcomes.
- API Tests: Validate authentication, game creation, and stat updates using Jest + Supertest.

### Running Tests

```bash
# Run all Jest tests
npm run test

# Run with coverage report
npm run test:coverage

# Run integration tests only
npm run test:integration

```

Test files live in the test directory 
```text
tests/
  ├── unit/
  │   ├── db.tests.ts
  │   ├── game-logic.tests.ts
  │   ├── session.tests.ts
  │   ├── user-actions.tests.ts
  │   └── utils.tests.ts
```
  
## Future Improvements

- Single Player mode with minimax algorithm
- Friends list and matchmaking.
- Analytics dashboard for win/loss trends.
- Dockerized deployment for containerized scaling.

