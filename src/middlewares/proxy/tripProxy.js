import { makeProxy } from "../proxy.js";
import cfg from "../../config.js";

const rewriteTrip = (_path, req) => {
  // Повертаємо повний шлях (з /api/v1/...) для trip-service
  return req?.originalUrl || _path;
};

export const tripProxy = makeProxy({
  target: cfg.upstream.trip, // напр. http://trip-service:3002
  changeOrigin: true,
  pathRewrite: rewriteTrip,

  onProxyReq: (proxyReq, req) => {
    if (req.headers.authorization) {
      proxyReq.setHeader("authorization", req.headers.authorization);
    }
    const cid = req.headers["x-correlation-id"] || req.id;
    if (cid) proxyReq.setHeader("x-correlation-id", cid);
  },

  onError: (err, _req, res) => {
    res.status(502).json({
      error: "Trip Service is unavailable",
      detail: err.code || err.message,
    });
  },
});

export default tripProxy;
