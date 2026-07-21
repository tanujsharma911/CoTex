import express, { type Express } from "express";
import cors from "cors";
import { config } from "./config/env.js";
import os from "os";

import { authRoute } from "./routes/auth.route.js";
import { docsRoute } from "./routes/docs.route.js";
import { usersRoute } from "./routes/users.route.js";

const replicaId = os.hostname() || "unknown-replica";

const app: Express = express();

app.use(
  cors({
    origin: config.CORS_ORIGINS,
    credentials: true,
    exposedHeaders: ["X-Server-Replica"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("X-Server-Replica", replicaId);
  next();
});

app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/docs", docsRoute);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Online" });
});

export { app };
