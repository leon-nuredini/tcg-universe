const winston = require('winston');
require('winston-mongodb');
const DailyRotateFile = require('winston-daily-rotate-file');

function createLogger(name, fileNamePrefix) {
    return winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.label({ label: name }),
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(({ level, message, label, timestamp }) =>
            `[${timestamp}] [${label}] ${level}: ${message}`
          )
      ),
      transports: [
        new winston.transports.Console({ colorize: true, prettyPrint: true }), // Log to the console
        createDailyFileRotation('info', name, fileNamePrefix),
        createDailyFileRotation('warn', name, fileNamePrefix),
        createDailyFileRotation('error', name, fileNamePrefix),
        new winston.transports.MongoDB({ db: process.env.DB_URL, level: 'error' }) // Log to db
      ]
    });
}

function createDailyFileRotation(level, name, fileNamePrefix){
    return new DailyRotateFile({
        level: level,
        dirname: `logs/${name.toLowerCase()}/${level}`,
        filename: `${fileNamePrefix}-${level}-%DATE%`,
        extension: '.log',
        datePattern: 'DD-MM-YYYY',
        zippedArchive: true,
        maxSize: '20m',
    }); // log to rotating file,
}

module.exports = { createLogger }