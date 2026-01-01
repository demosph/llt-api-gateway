import { createProxyMiddleware } from "http-proxy-middleware";

export const makeRewriter = (fromPrefix, toPrefix) => (path, req) => {
  if (path.startsWith(fromPrefix)) return path.replace(fromPrefix, toPrefix);

  if (req?.baseUrl && req.baseUrl.endsWith(fromPrefix)) {
    return toPrefix + path;
  }

  return path;
};

export const makeProxy = (opts) => {
  const userOnProxyReq = opts.onProxyReq;
  const userOnError = opts.onError;

  return createProxyMiddleware({
    changeOrigin: true,
    xfwd: true,
    logLevel: "warn",

    ...opts,

    onProxyReq: (proxyReq, req, res) => {
      if (typeof userOnProxyReq === "function") {
        userOnProxyReq(proxyReq, req, res);
      }

      proxyReq.removeHeader("connection");
    },

    onError: (err, req, res) => {
      if (typeof userOnError === "function") return userOnError(err, req, res);
      if (res.headersSent) return;

      res.status(502).json({
        error: "Upstream is unavailable",
        detail: err.code || err.message,
      });
    },
  });
};
