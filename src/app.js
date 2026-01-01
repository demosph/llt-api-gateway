import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cfg from "./config.js";
import { httpLogger } from "./utils/logger.js";
import { correlationId } from "./middlewares/correlation.js";
import { idempotency } from "./middlewares/idempotency.js";
import { requiredAuth, optionalAuth } from "./middlewares/auth.js";
import { mountSwagger } from "./swagger.js";
import {
  aiProxy,
  authProxy,
  tripProxy,
  integrationProxy,
} from "./middlewares/proxy/index.js";

export function buildApp() {
  const app = express();

  app.set("trust proxy", process.env.TRUST_PROXY ?? true);

  app.use(helmet());

  const corsOptions = {
    origin: cfg.corsOrigin === "*" ? true : cfg.corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Correlation-Id",
      "Idempotency-Key",
    ],
  };

  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));
  app.use(correlationId());
  app.use(httpLogger);

  // rate-limit (глобально)
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Idempotency для state-changing
  app.use(idempotency());

  // Health endpoint
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // Swagger UI
  mountSwagger(app);

  // Проксі до мікросервісів
  app.use("/api/v1/auth", optionalAuth, authProxy);

  // Auth & User service (users/me*)
  app.use("/api/v1/users/me", requiredAuth, authProxy);

  // Integration / AI
  app.use("/api/v1/integrations", requiredAuth, integrationProxy);
  app.use("/api/v1/ai", requiredAuth, aiProxy);

  // Trips service
  app.use("/api/v1/trips", requiredAuth, tripProxy);

  // ТІЛЬКИ user trips йдуть у trip-service
  app.use("/api/v1/users", (req, res, next) => {
    if (/^\/api\/v1\/users\/[^/]+\/trips(?:\/|$)/.test(req.originalUrl)) {
      return tripProxy(req, res, next);
    }
    return next();
  });

  // 404
  app.use((req, res) =>
    res.status(404).json({ error: "NotFound", path: req.path })
  );

  // Загальний error handler
  // (важливо: 4 аргументи, щоб Express розпізнав як error middleware)
  app.use((err, _req, res, _next) => {
    console.error("[unhandled]", err);
    res.status(500).json({ error: "InternalError" });
  });

  return app;
}
