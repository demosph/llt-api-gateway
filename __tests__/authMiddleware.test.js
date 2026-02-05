import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import { makeReq, makeRes, importFresh, expectStatus } from "./testUtils.js";

test("requiredAuth: 401 when token missing", async () => {
  process.env.JWT_ALG = "HS256";
  process.env.JWT_SECRET = "testsecret";

  const { requiredAuth } = await importFresh("../src/middlewares/auth.js");

  const req = makeReq({ headers: {} });
  const res = makeRes();
  let nextCalled = false;

  requiredAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  expectStatus(res, 401);
  assert.deepEqual(res.body, { error: "NoToken" });
});

test("optionalAuth: does not block when token missing", async () => {
  process.env.JWT_ALG = "HS256";
  process.env.JWT_SECRET = "testsecret";

  const { optionalAuth } = await importFresh("../src/middlewares/auth.js");

  const req = makeReq({ headers: {} });
  const res = makeRes();
  let nextCalled = false;

  optionalAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res._ended, false);
  assert.equal(req.user, undefined);
});

test("requiredAuth: sets req.user on valid HS256 token", async () => {
  process.env.JWT_ALG = "HS256";
  process.env.JWT_SECRET = "testsecret";

  const origVerify = jwt.verify;
  jwt.verify = () => ({ sub: "u1", email: "a@b.com", roles: ["user"] });

  const { requiredAuth } = await importFresh("../src/middlewares/auth.js");

  const req = makeReq({ headers: { authorization: "Bearer good" } });
  const res = makeRes();
  let nextCalled = false;

  requiredAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, { id: "u1", email: "a@b.com", roles: ["user"] });

  jwt.verify = origVerify;
});

test("requiredAuth: 401 on invalid token", async () => {
  process.env.JWT_ALG = "HS256";
  process.env.JWT_SECRET = "testsecret";

  const origVerify = jwt.verify;
  jwt.verify = () => {
    throw new Error("bad");
  };

  const { requiredAuth } = await importFresh("../src/middlewares/auth.js");

  const req = makeReq({ headers: { authorization: "Bearer bad" } });
  const res = makeRes();
  let nextCalled = false;

  requiredAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  expectStatus(res, 401);
  assert.deepEqual(res.body, { error: "InvalidToken" });

  jwt.verify = origVerify;
});
