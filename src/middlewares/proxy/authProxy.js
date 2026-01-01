import { makeProxy } from "../proxy.js";
import cfg from "../../config.js";

const rewriteAuth = (_path, req) => {
  const url = req?.originalUrl || _path; // includes /api/v1/auth/... + ?query
  const [pathOnly, qs] = url.split("?");

  const decodedPath = pathOnly.replace(/%2F/gi, "/");

  return qs ? `${decodedPath}?${qs}` : decodedPath;
};

export const authProxy = makeProxy({
  target: cfg.upstream.auth, // http://auth-service:3001
  changeOrigin: true,
  pathRewrite: rewriteAuth,

  onProxyReq: (proxyReq, req) => {
    if (req.headers.authorization) {
      proxyReq.setHeader("authorization", req.headers.authorization);
    }
    const cid = req.headers["x-correlation-id"] || req.id;
    if (cid) proxyReq.setHeader("x-correlation-id", cid);
  },

  onError: (err, _req, res) => {
    res.status(502).json({
      error: "Auth Service is unavailable",
      detail: err.code || err.message,
    });
  },
});

export default authProxy;
