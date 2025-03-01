class CustomError extends Error {
  constructor(message, statusCode, errorType = 'general') {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true;
    this.errorType = errorType; // Categorizing errors
    Error.captureStackTrace(this, this.constructor);
  }

  // 4xx Errors (Client Side)
  static tokenError(message) {
    return new CustomError(message, 401, `token: ${message}`);
  }

  static authError(message) {
    return new CustomError(message, 403, `auth: ${message}`);
  }

  static validationError(message) {
    return new CustomError(message, 400, `validation: ${message}`);
  }

  static notFoundError(message) {
    return new CustomError(message, 404, `notFound: ${message}`);
  }

  static duplicateError(message) {
    return new CustomError(message, 400, `duplicate: ${message}`);
  }

  static unauthorizedError(message) {
    return new CustomError(message, 401, `unauthorized: ${message}`);
  }

  static badRequestError(message) {
    return new CustomError(message, 422, `badRequest: ${message}`);
  }

  // 5xx Errors (Server Side)
  static internalServerError(message = "Internal Server Error") {
    return new CustomError(message, 500, `server: ${message}`);
  }

  static databaseError(message = "Database Error") {
    return new CustomError(message, 500, `database: ${message}`);
  }

  // Unknown error fallback
  static unknownError(message = "An unknown error occurred") {
    return new CustomError(message, 500, `unknown: ${message}`);
  }
}

module.exports = CustomError;
