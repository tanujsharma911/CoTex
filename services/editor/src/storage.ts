import { S3Client } from "@cotex/storage";
import { config } from "./config/env.js";

export const storage = new S3Client({
  accessKey: config.MINIO_ACCESS_KEY,
  secretAccessKey: config.MINIO_SECRET_KEY,
  endpoint: config.MINIO_URL,
  bucketName: config.MINIO_BUCKET,
});

