import Redis from "ioredis";
import cfg from "../config.js";

let redis = null;

export function getRedis() {
  if (!cfg.redisUrl) return null;
  if (!redis) {
    redis = new Redis(cfg.redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
    });
    redis.on("error", (e) => {
      console.error("[redis] error:", e.message);
    });
  }
  return redis;
}
