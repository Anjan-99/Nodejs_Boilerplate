const morgan = require('morgan');
const logger = require('../utils/logger');

const stream = {
  write: (message) => logger.info(message.trim()), // Pass logs to Winston
};

const morganMiddleware = morgan(
  '[Method: :method | Route: :url | status_code: :status Res: | :response-time ms - Size: :res[content-length]]',
  { stream }
);

module.exports = morganMiddleware;