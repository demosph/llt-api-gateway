import { makeProxy } from "../proxy.js";
import cfg from "../../config.js";

const rewriteIntegration = (_path, req) => {
  const url = req?.originalUrl || _path;
  const [pathOnly, qs] = url.split("?");

  const decodedPath = pathOnly.replace(/%2F/gi, "/");

  return qs ? `${decodedPath}?${qs}` : decodedPath;
};

export const integrationProxy = makeProxy({
  target: cfg.upstream.integration, // e.g. http://integration-service:3003
  changeOrigin: true,
  pathRewrite: rewriteIntegration,

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
      error: "Integration Service is unavailable",
      detail: err.code || err.message,
    });
  },
});

export default integrationProxy;
