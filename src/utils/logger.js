import morgan from "morgan";

// мінімальний комбінований логер HTTP
export const httpLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms - reqId=:req[x-request-id]"
);
