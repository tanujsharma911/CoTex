import { WebSocketServer } from "ws";
import http from "http";

import { config } from "./config/env.js";
import { wsConnection } from "./websocket.js";
import { connectDB } from "./db/connection.js";

const server = http.createServer();

connectDB().then(() => {
  server.listen(config.PORT, () => {
    console.log(`🟢 server running on port: ${config.PORT}`);
  });

  const wsServer = new WebSocketServer({ server });

  wsServer.on("connection", wsConnection.handle);
});
