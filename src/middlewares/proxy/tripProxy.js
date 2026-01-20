import { makeProxy } from "../proxy.js";
import cfg from "../../config.js";

const rewriteTrip = (_path, req) => {
  return req?.originalUrl || _path;
};

export const tripProxy = makeProxy({
  target: cfg.upstream.trip, // e.g. http://trip-service:3002
  changeOrigin: true,
  pathRewrite: rewriteTrip,

  onProxyReq: (proxyReq, req) => {
    if (req.headers.authorization) {
      proxyReq.setHeader("authorization", req.headers.authorization);
    }

    const cid = req.headers["x-correlation-id"] || req.id;
    if (cid) proxyReq.setHeader("x-correlation-id", cid);

    // forward user context headers
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
      error: "Trip Service is unavailable",
      detail: err.code || err.message,
    });
  },
});

export default tripProxy;
