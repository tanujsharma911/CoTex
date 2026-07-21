import { Redis } from "ioredis";

export function createRedisClient({
  host,
  port,
}: {
  host: string;
  port: number;
}): Redis {
  return new Redis({ host, port });
}
