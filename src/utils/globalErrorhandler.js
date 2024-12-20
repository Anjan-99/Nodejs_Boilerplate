require('dotenv/config'); // Import dotenv config
const logger = require('./logger.js'); // Import logger

const devErrors = (err, res) => {
  logger.error("Error 💥", err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const prodErrors = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    devErrors(err, res);
  } else if (process.env.NODE_ENV === "production") {
    prodErrors(err, res);
  }
}

module.exports = globalErrorHandler;
