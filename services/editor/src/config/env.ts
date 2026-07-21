import dotenv from 'dotenv';
dotenv.config();

export const config = {
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  PORT: process.env.EDITOR_PORT || 2001,
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'your-secret-key',
  TOKEN_EXPIRY: process.env.TOKEN_EXPIRY || '1d', // Token expiry time
  MONGODB_URL: process.env.MONGODB_URL,

  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),
  REDIS_HOST: process.env.REDIS_HOST || 'localhost'
};
