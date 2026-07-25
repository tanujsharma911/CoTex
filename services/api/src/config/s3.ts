import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./env.js";

export const s3 = new S3Client({
  endpoint: config.MINIO_URL,
  region: "us-east-1",
  credentials: {
    accessKeyId: config.MINIO_ACCESS_KEY,
    secretAccessKey: config.MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});