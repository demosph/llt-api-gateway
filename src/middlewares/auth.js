import jwt from "jsonwebtoken";
import cfg from "../config.js";

// Мідлвар для перевірки Bearer JWT
function verify(req, res, required) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;

  if (!token) {
    if (required) return res.status(401).json({ error: "NoToken" });
    return null;
  }

  try {
    const payload =
      cfg.jwt.alg === "RS256"
        ? jwt.verify(token, cfg.jwt.publicKey, { algorithms: ["RS256"] })
        : jwt.verify(token, cfg.jwt.secret, { algorithms: ["HS256"] });

    req.user = { id: payload.sub, email: payload.email, roles: payload.roles };
    return payload;
  } catch (e) {
    if (required) return res.status(401).json({ error: "InvalidToken" });
    return null;
  }
}

export function optionalAuth(req, res, next) {
  try {
    verify(req, res, false);
  } catch (_) {}
  next();
}

export function requiredAuth(req, res, next) {
  const ok = verify(req, res, true);
  if (!ok) return; // відповідь уже надіслано
  next();
}
