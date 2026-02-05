import cfg from "../config.js";
import { getRedis } from "../utils/redis.js";

// Кешує відповіді для запитів із побічними ефектами при наявності Idempotency-Key
// Зберігаємо: статус, заголовки, тіло.
export function idempotency() {
  const redis = getRedis();
  const memory = new Map();

  return async (req, res, next) => {
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();
    const key = req.headers["idempotency-key"];
    if (!key) return next();

    const cacheKey = `idem:${key}`;
    // 1) спроба дістати кеш
    try {
      let cached;
      if (redis) {
        const raw = await redis.get(cacheKey);
        if (raw) cached = JSON.parse(raw);
      } else {
        cached = memory.get(cacheKey);
      }
      if (cached) {
        res.set(cached.headers || {});
        return res.status(cached.status).send(cached.body);
      }
    } catch (e) {
      // ігноруємо, щоб не ламати запит через кеш
      console.warn("[idem] get error:", e.message);
    }

    // 2) обгорнемо res.send, щоб зловити відповідь і закешувати її
    const _send = res.send.bind(res);
    res.send = async (body) => {
      const payload = {
        status: res.statusCode || 200,
        headers: {
          "x-idempotent": "1",
          "content-type": res.getHeader("content-type"),
        },
        body,
      };
      try {
        if (redis) {
          await redis.setex(
            cacheKey,
            cfg.idempotencyTtl,
            JSON.stringify(payload),
          );
        } else {
          memory.set(cacheKey, payload);
          setTimeout(() => memory.delete(cacheKey), cfg.idempotencyTtl * 1000);
        }
      } catch (e) {
        console.warn("[idem] set error:", e.message);
      }
      return _send(body);
    };

    next();
  };
}
