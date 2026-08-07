import { createRedisClient } from '@cotex/redis';
import { config } from './config/env.js';

export const pubClient = createRedisClient(config.REDIS_URL);
export const subClient = createRedisClient(config.REDIS_URL);
