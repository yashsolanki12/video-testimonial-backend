import { StatusCode } from "./status-code.js";

export class AppError extends Error {
  status: StatusCode;

  constructor(
    message: string,
    status: StatusCode = StatusCode.INTERNAL_SERVER_ERROR,
  ) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}
