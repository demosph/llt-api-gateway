import rateLimit from "express-rate-limit";

const windowMs = Number(process.env.RATE_WINDOW_MS ?? 15 * 60 * 1000);
const max = Number(process.env.RATE_MAX ?? 1000);

const skipPaths = (process.env.RATE_SKIP_PATHS ?? "/health,/docs,/swagger")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const apiRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => skipPaths.some((p) => req.path.startsWith(p)),
  keyGenerator: (req) => req.ip,
  validate: { trustProxy: false },
});
