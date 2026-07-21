import dotenv from 'dotenv';
dotenv.config();

export const config = {
  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:5173',
  PORT: process.env.API_PORT || 2000,
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'your-secret-key',
  TOKEN_EXPIRY: process.env.TOKEN_EXPIRY || '1d', // Token expiry time
  MONGODB_URL: process.env.MONGODB_URL,

  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost',
  MINIO_PORT: parseInt(process.env.MINIO_PORT || '7000'),
  MINIO_ROOT_USER: process.env.MINIO_ROOT_USER || 'admin',
  MINIO_ROOT_PASSWORD: process.env.MINIO_ROOT_PASSWORD || 'password'
};
