import { S3 } from '@cotex/storage';
import { config } from './config/env.js';

export const storage = new S3({
  accessKey: config.MINIO_ACCESS_KEY,
  secretAccessKey: config.MINIO_SECRET_KEY,
  endpoint: config.MINIO_URL,
  publicEndpoint: config.MINIO_PUBLIC_URL,
  bucketName: config.MINIO_BUCKET
});
