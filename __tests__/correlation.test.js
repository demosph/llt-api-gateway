import test from "node:test";
import assert from "node:assert/strict";

import { correlationId } from "../src/middlewares/correlation.js";
import { makeReq, makeRes } from "./testUtils.js";

test("correlationId: uses incoming x-request-id and echoes it", () => {
  const mw = correlationId();
  const req = makeReq({ headers: { "x-request-id": "req-123" } });
  const res = makeRes();
  let nextCalled = false;

  mw(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.id, "req-123");
  assert.equal(res.getHeader("x-request-id"), "req-123");
});

test("correlationId: generates id when header missing", () => {
  const mw = correlationId();
  const req = makeReq({ headers: {} });
  const res = makeRes();
  let nextCalled = false;

  mw(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(typeof req.id, "string");
  assert.ok(req.id.length > 10);
  assert.equal(res.getHeader("x-request-id"), req.id);
});
