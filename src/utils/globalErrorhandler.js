require('dotenv/config'); 
const logger = require('./logger.js'); 
const CustomError = require('./customError.js'); // Import CustomError class

const devErrors = (err, res) => {
  logger.error("Error 💥", err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    errorType: err.errorType || "unknown",
    error: err,
  });
};

const prodErrors = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errorType: err.errorType || "unknown",
    });
  } else {
    logger.error("Unexpected Error ❌", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

function globalErrorHandler(err, req, res, next) {
  if (!(err instanceof CustomError)) {
    logger.error("Unhandled Error 🚨", err);
    err = CustomError.unknownError(err.message || "Unexpected server error");
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    devErrors(err, res);
  } else {
    prodErrors(err, res);
  }
}

module.exports = globalErrorHandler;
