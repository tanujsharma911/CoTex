import { createRedisClient } from "@cotex/redis";
import { config } from "./config/env.js";

export const pubClient = createRedisClient({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
});

export const subClient = createRedisClient({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
});
