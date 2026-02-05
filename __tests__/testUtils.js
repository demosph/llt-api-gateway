import assert from "node:assert/strict";

export async function importFresh(path) {
  const u = new URL(path, import.meta.url);
  u.searchParams.set("_", String(Date.now()) + "-" + Math.random());
  return import(u.href);
}

function normalizeHeaders(h) {
  const out = {};
  for (const [k, v] of Object.entries(h || {})) {
    out[String(k).toLowerCase()] = v;
  }
  return out;
}

export function makeReq({
  method = "GET",
  headers = {},
  originalUrl = "/",
  path = "/",
  baseUrl = "",
  body = undefined,
} = {}) {
  return {
    method,
    headers: normalizeHeaders(headers),
    originalUrl,
    path,
    baseUrl,
    body,
    id: undefined,
    user: undefined,
  };
}

export function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    _ended: false,

    status(code) {
      this.statusCode = code;
      return this;
    },

    set(field, value) {
      if (typeof field === "object" && field) {
        for (const [k, v] of Object.entries(field)) {
          this.headers[String(k).toLowerCase()] = v;
        }
        return this;
      }
      this.headers[String(field).toLowerCase()] = value;
      return this;
    },

    setHeader(field, value) {
      this.headers[String(field).toLowerCase()] = value;
    },

    getHeader(field) {
      return this.headers[String(field).toLowerCase()];
    },

    json(payload) {
      this.body = payload;
      this._ended = true;
      return this;
    },

    send(payload) {
      this.body = payload;
      this._ended = true;
      return this;
    },

    end() {
      this._ended = true;
      return this;
    },
  };
}

export function expectStatus(res, code) {
  assert.equal(res.statusCode, code);
}
