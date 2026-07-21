import * as Minio from "minio";
import { config } from "./config/env.js";

const minioClient = new Minio.Client({
  endPoint: config.MINIO_ENDPOINT,
  port: config.MINIO_PORT,
  useSSL: true,
  accessKey: config.MINIO_ROOT_USER,
  secretKey: config.MINIO_ROOT_PASSWORD,
});
