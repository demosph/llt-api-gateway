import test from "node:test";
import assert from "node:assert/strict";

import { makeRewriter } from "../src/middlewares/proxy.js";
import { makeReq } from "./testUtils.js";

test("makeRewriter: replaces fromPrefix at start of path", () => {
  const rw = makeRewriter("/api/v1/ai", "/internal/v1/ai");
  const out = rw("/api/v1/ai/recommend", makeReq());
  assert.equal(out, "/internal/v1/ai/recommend");
});

test("makeRewriter: when baseUrl ends with fromPrefix, prepends toPrefix", () => {
  const rw = makeRewriter("/api/v1/ai", "/internal/v1/ai");
  const req = makeReq({ baseUrl: "/api/v1/ai" });
  const out = rw("/recommend", req);
  assert.equal(out, "/internal/v1/ai/recommend");
});

test("makeRewriter: leaves path unchanged when no match", () => {
  const rw = makeRewriter("/a", "/b");
  const out = rw("/x/y", makeReq());
  assert.equal(out, "/x/y");
});
