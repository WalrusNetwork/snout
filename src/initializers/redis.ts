/**
 * Redis Client Initializer
 * @author Indicado
 */

import * as redis from "redis";
import { promisify } from "util";

// eslint-disable-next-line
declare class process {
  static env: {
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD: string;
  };
}

const Redis = redis.createClient({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
});

export default Redis;
export const getAsync = promisify(Redis.hgetall).bind(Redis);
export const getLrange = promisify(Redis.lrange).bind(Redis);
