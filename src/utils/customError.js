class customError extends Error {
  constructor(message, statusCode, errorType = 'general') {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true;
    this.errorType = errorType; // Add error type for better classification
    Error.captureStackTrace(this, this.constructor);
  }

  static tokenError(message) {
    return new customError(message, 401, 'token');
  }

  static authError(message) {
    return new customError(message, 403, 'auth');
  }

  static validationError(message) {
    return new customError(message, 400, 'validation');
  }

  static notFoundError(message) {
    return new customError(message, 404, 'notFound');
  }

  static duplicateError(message) {
    return new customError(message, 400, 'duplicate');
  }

  static unauthorizedError(message) {
    return new customError(message, 401, 'unauthorized');
  }
  
}

module.exports = customError;
