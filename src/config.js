import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const cfg = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",

  jwt: {
    alg: process.env.JWT_ALG ?? "RS256",
    publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH,
    secret: process.env.JWT_SECRET,
  },

  timeouts: {
    requestMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 10000),
    proxyMs: Number(process.env.PROXY_TIMEOUT_MS ?? 15000),
    retries: Number(process.env.RETRIES ?? 2),
  },

  redisUrl: process.env.REDIS_URL,
  idempotencyTtl: Number(process.env.IDEMPOTENCY_TTL_SECONDS ?? 86400),

  upstream: {
    auth: process.env.AUTH_SERVICE_URL,
    trip: process.env.TRIP_SERVICE_URL,
    integration: process.env.INTEGRATION_SERVICE_URL,
    ai: process.env.AI_SERVICE_URL,
  },

  publicBaseUrl: process.env.PUBLIC_BASE_URL,
};

// Підтягуємо публічний ключ для RS256 (якщо задано шлях)
cfg.jwt.publicKey =
  cfg.jwt.alg === "RS256" && cfg.jwt.publicKeyPath
    ? fs.readFileSync(path.resolve(cfg.jwt.publicKeyPath), "utf8")
    : undefined;

export default cfg;
