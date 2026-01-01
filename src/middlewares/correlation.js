import { v4 as uuid } from "uuid";

export function correlationId() {
  return (req, res, next) => {
    const incoming = req.headers["x-request-id"];
    const id = incoming && typeof incoming === "string" ? incoming : uuid();
    req.id = id;
    res.setHeader("X-Request-ID", id);
    next();
  };
}
