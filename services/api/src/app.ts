import express, { type Express } from "express";
import cors from "cors";
import { config } from "./config/env.js";
import os from "os";

import { authRoute } from "./routes/auth.route.js";
import { docsRoute } from "./routes/docs.route.js";
import { usersRoute } from "./routes/users.route.js";
import { upload } from "./middlewares/multer.middleware.js";
import path from "path";
import { s3 } from "./config/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  // never trust the client-supplied filename directly as the key
  const ext = path.extname(req.file.originalname);
  const key = `uploads/${crypto.randomUUID()}${ext}`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: config.MINIO_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    res.status(201).json({ key });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Online" });
});

export { app };
