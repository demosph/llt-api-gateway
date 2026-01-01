import cfg from "./config.js";
import { buildApp } from "./app.js";

const app = buildApp();

const server = app.listen(cfg.port, () => {
  console.log(`[gateway] listening on :${cfg.port} (${cfg.env})`);
});

function shutdown(sig) {
  console.log(`[gateway] ${sig} received, shutting down...`);
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
