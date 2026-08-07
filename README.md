# CoTex - Collaborative Latex code Editor

<div>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="WebSocket" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</div>

![preview](https://github.com/user-attachments/assets/119f6fc9-2b45-4fb6-aeac-7b9136e3aed7)

<div align="center">

[🌐 View Live](https://cotex.tanujsharma.me)

</div>

## Key Highlights

1. **Conflict Resolution**: Document contains datatype(eg. text, array, map, etc). Document updates are **commutative, associative, and idempotent** means changes applied to doc in any order results same output.
2. **Sync Protocol**: Client sends a State Vector. Server calculates the between server doc and client doc and sends back only the missing updates.
3. **Awareness**: Multiple users can edit same doc. Awareness protocol shares metadata about users (eg. cursor position, name, color) to other users in real-time.

## Functional Requirements

- Users can do CRUD operations on doc.
- Multiple users can connect to same doc.
- Users can see real-time changes of other users on doc.
- Users can see realtime cursor movement of others.

## Non-Functional Requirements

- Millions of users, Millions of documents.
- Up to 100 concurrent users per document.
- Latency max 200ms.
- Documents to converge / consistency

## High Level Design

![preview](https://github.com/user-attachments/assets/488836f9-33ab-448c-abd3-ac0c9e83da20)

#### Components:

1. **Reverse Proxy**: Client requests first hit the Reverse Proxy, which routes them to the appropriate backend services.

2. **Load Balancer**: The Load Balancer distributes incoming connections across multiple Editor Service instances (Currently only 2), using nginx round-robin distribution.

3. **Server**: The Server handles WebSocket connections, REST APIs with the database and Redis for persistence and pub/sub functionality.

4. **MongoDB**: The MongoDB database stores the document data, including the Y.Doc state and user awareness information. Currently using MongoDB Atlas.

5. **Pub/Sub**: The Pub/Sub system is implemented using Redis. It allows the websocket service instances to communicate with each other, Used to scale node.js servers horizontally.

## Tools & Technologies used in demo

| Layer    | Choice                                              | Why                                                  |
| -------- | --------------------------------------------------- | ---------------------------------------------------- |
| Frontend | `React` + `yjs`(Data Structures)                    | yjs handles CRDTs and it is Local-first architecture |
| Backend  | `Node.js` + `ws` + `Redis` + `yjs`(Data Structures) | pairs well with yjs                                  |
| DB       | `MongoDB`                                           | simple, deployable                                   |
| Deploy   | Hostinger VPS using Docker                          | Production environment                               |

## Local Setup Instructions

Setup license for minio
1. Clone the repository

   ```
   mkdir CoTex
   cd CoTex
   git clone https://github.com/tanujsharma911/CoTex.git .
   ```

2. Install dependencies for both frontend and backend

   ```
   cd client
   npm install
   cd ../server
   npm install
   ```

3. Install latex compiler
   - For Windows: Install MiKTeX from https://miktex.org/download
   - For Mac OS: Install MacTeX from http://www.tug.org/mactex/

4. Create `.env` file in client folder. Paste this

   ```
   VITE_HTTP_SEVER=http://localhost:3000
   VITE_WS_SEVER=ws://localhost:3000
   ```

5. Create `.env` file in server folder. Paste this and update with your keys

   ```
   PORT=3000
   CLIENT_URL=http://localhost:5173
   TOKEN_SECRET=<RANDOM_LONG_STRING>
   TOKEN_EXPIRY=1d
   MONGODB_URL=<MONGO_DB_ATLAS_URL>

   REDIS_PORT=6379
   REDIS_HOST=localhost
   ```

6. Run Redis server (if not already running)

   ```
   docker run -d \
   --name redis \
   -p 6379:6379 \
   redis:latest
   ```

7. Start the backend server

   ```
   cd server
   npm run dev
   ```

8. Start the frontend development server

   ```
   cd client
   npm run dev
   ```

9. Open the application in your browser at `http://localhost:5173` and start collaborating on LaTeX documents in real-time!

## Running in Docker Environment

1. Clone the repository

   ```
   mkdir CoTex
   cd CoTex
   git clone https://github.com/tanujsharma911/CoTex.git .
   ```

2. Create `.env.docker` file in client folder. Paste this

   ```
   VITE_HTTP_SEVER=http://localhost:8000
   VITE_WS_SEVER=ws://localhost:8000
   ```

3. Create `.env.docker` file in server folder. Paste this and update with your keys

   ```
   PORT=3000
   CLIENT_URL=http://localhost:5175
   TOKEN_SECRET=<RANDOM_LONG_STRING>
   TOKEN_EXPIRY=1d
   MONGODB_URL=<MONGO_DB_ATLAS_URL>

   REDIS_PORT=6379
   REDIS_HOST=localhost
   ```

4. Build tex compiler image

   ```
   cd server
   docker build -t tex-compiler -f Dockerfile.tex .
   ```

5. Start

   ```
   docker compose up --build
   ```

6. Open the application in your browser at `http://localhost:5175` and start collaborating on LaTeX documents in real-time!
