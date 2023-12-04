const winston = require('winston');

const colorize = winston.format.colorize();

const conf = (() => {
  const logger = {
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf((e) => colorize.colorize(
        e.level,
        `${e.timestamp} [${e.level[0].toUpperCase()}] ${e.message}`
      ))
    ),
    level: 'info'
  };

  return { logger };
})();

const logger = winston.createLogger({
  format: winston.format.splat(),
  transports: [new winston.transports.Console(conf.logger)]
});

module.exports = logger;