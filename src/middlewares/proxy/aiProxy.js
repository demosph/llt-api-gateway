import { makeProxy, makeRewriter } from "../proxy.js";
import cfg from "../../config.js";

const rewriteAi = makeRewriter("/api/v1/ai", "/internal/v1/ai");

export const aiProxy = makeProxy({
  target: cfg.upstream.ai,  // http://ai-recommender:8000
  changeOrigin: true,
  pathRewrite: rewriteAi,

  onProxyReq: (proxyReq, req) => {
    if (req.headers.authorization) {
      proxyReq.setHeader("authorization", req.headers.authorization);
    }
    const cid = req.headers["x-correlation-id"] || req.id;
    if (cid) proxyReq.setHeader("x-correlation-id", cid);
  },

  onError: (err, _req, res) => {
    res.status(502).json({
      error: "AI Recommender is unavailable",
      detail: err.code || err.message,
    });
  },
});

export default aiProxy;
