import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.EDITOR_PORT || 2001,
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'your-secret-key',
  TOKEN_EXPIRY: process.env.TOKEN_EXPIRY || '1d', // Token expiry time
  MONGODB_URL: process.env.MONGODB_URL,

  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',

  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:5173',

  MINIO_URL: process.env.MINIO_URL || 'http://localhost:9000',
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || 'cotex',
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY || 'password',
  MINIO_BUCKET: process.env.MINIO_BUCKET || 'cotex'
};

