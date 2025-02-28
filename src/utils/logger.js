const colors = require('colors');
const { createLogger, format, transports } = require('winston');
const moment = require('moment');
require('dotenv/config');

const { combine, timestamp, printf, uncolorize } = format;

// Custom log format with Colors.js (for console)
const coloredLogFormat = printf(({ level, message, timestamp }) => {
  const levelColor =
    level === 'error'
      ? colors.red(level)
      : level === 'warn'
      ? colors.yellow(level)
      : colors.green(level);

  return `${colors.blue(timestamp)} ${levelColor}: ${message}`;
});

// Standard log format (without colors for file transports)
const plainLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Define format for file logs (uncolorized)
const fileFormat = combine(
  timestamp({ format: () => moment().format('YYYY-MM-DD HH:mm:ss') }),
  uncolorize(), // removes ANSI color codes
  plainLogFormat
);

// Define format for console logs (with colors)
const consoleFormat = combine(
  timestamp({ format: () => moment().format('YYYY-MM-DD HH:mm:ss') }),
  coloredLogFormat
);

const logger = createLogger({
  level: 'info',
  transports: [
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
    }),
    new transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
    }),
    new transports.Console({
      format: consoleFormat,
    }),
  ],
});

module.exports = logger;
