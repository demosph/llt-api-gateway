import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { importFresh } from "./testUtils.js";

test("config: loads RS256 public key when JWT_PUBLIC_KEY_PATH provided", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "llt-gw-"));
  const keyPath = path.join(dir, "public.pem");
  fs.writeFileSync(keyPath, "PUBLIC_KEY_TEST", "utf8");

  process.env.JWT_ALG = "RS256";
  process.env.JWT_PUBLIC_KEY_PATH = keyPath;
  delete process.env.JWT_SECRET;

  const { default: cfg } = await importFresh("../src/config.js");

  assert.equal(cfg.jwt.alg, "RS256");
  assert.equal(cfg.jwt.publicKey, "PUBLIC_KEY_TEST");
});
