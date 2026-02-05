import jwt from "jsonwebtoken";
import cfg from "../config.js";

// Parse Bearer token once
function getBearerToken(req) {
  const hdr = req.headers.authorization || "";
  return hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
}

// Verify token; when required=true, sends 401 and returns null
function verify(req, res, required) {
  const token = getBearerToken(req);

  if (!token) {
    if (required) {
      res.status(401).json({ error: "NoToken" });
    }
    return null;
  }

  try {
    const payload =
      cfg.jwt.alg === "RS256"
        ? jwt.verify(token, cfg.jwt.publicKey, { algorithms: ["RS256"] })
        : jwt.verify(token, cfg.jwt.secret, { algorithms: ["HS256"] });

    req.user = { id: payload.sub, email: payload.email, roles: payload.roles };
    return payload;
  } catch (_) {
    if (required) {
      res.status(401).json({ error: "InvalidToken" });
    }
    return null;
  }
}

export function optionalAuth(req, res, next) {
  verify(req, res, false);
  next();
}

export function requiredAuth(req, res, next) {
  const payload = verify(req, res, true);
  if (!payload) return; // 401 already sent (or no token)
  next();
}
