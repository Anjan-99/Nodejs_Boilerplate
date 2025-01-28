const colors = require('colors');
const { createLogger, format, transports } = require('winston');
require('dotenv/config');

const { combine, timestamp, printf } = format;

// Custom log format with Colors.js
const logFormat = printf(({ level, message, timestamp }) => {
  const levelColor =
    level === 'error'
      ? colors.red(level)
      : level === 'warn'
      ? colors.yellow(level)
      : colors.green(level);

  return `${colors.blue(timestamp)} ${levelColor}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

logger.add(
  new transports.Console({
    format: combine(logFormat),
  })
);

module.exports = logger;
