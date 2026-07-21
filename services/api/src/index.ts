import http from "http";

import { app } from "./app.js";
import { config } from "./config/env.js";
import { connectDB } from "./db/connection.js";

const server = http.createServer(app);

connectDB().then(() => {
  server.listen(config.PORT, () => {
    console.log(`🟢 server running on port: ${config.PORT}`);
  });
});
