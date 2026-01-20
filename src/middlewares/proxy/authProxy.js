import { makeProxy } from "../proxy.js";
import cfg from "../../config.js";

const rewriteAuth = (_path, req) => {
  const url = req?.originalUrl || _path; // includes /api/v1/auth/... + ?query
  const [pathOnly, qs] = url.split("?");

  const decodedPath = pathOnly.replace(/%2F/gi, "/");

  return qs ? `${decodedPath}?${qs}` : decodedPath;
};

export const authProxy = makeProxy({
  target: cfg.upstream.auth, // e.g. http://auth-service:3001
  changeOrigin: true,
  pathRewrite: rewriteAuth,

  onProxyReq: (proxyReq, req) => {
    // Forward Authorization (JWT) if present
    if (req.headers.authorization) {
      proxyReq.setHeader("authorization", req.headers.authorization);
    }

    // Correlation id
    const cid = req.headers["x-correlation-id"] || req.id;
    if (cid) proxyReq.setHeader("x-correlation-id", cid);

    // Forward user context resolved by gateway auth middleware (if any)
    // NOTE: downstream services must trust these headers only when requests
    // come from the gateway/internal network.
    if (req.user?.id) proxyReq.setHeader("x-user-id", req.user.id);
    if (req.user?.email) proxyReq.setHeader("x-user-email", req.user.email);

    if (req.user?.roles) {
      proxyReq.setHeader(
        "x-user-roles",
        Array.isArray(req.user.roles)
          ? req.user.roles.join(",")
          : String(req.user.roles),
      );
    }
  },

  onError: (err, _req, res) => {
    res.status(502).json({
      error: "Auth Service is unavailable",
      detail: err.code || err.message,
    });
  },
});

export default authProxy;
