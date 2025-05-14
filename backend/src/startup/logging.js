const winston = require('winston');
const { notFound, errorHandler } = require('../middleware/error.middleware');

module.exports = function(app) {
    winston.exceptions.handle(
        new winston.transports.Console({ colorize: true, prettyPrint: true }),
        new winston.transports.File({ filename: 'logs/uncaughtExceptions.log' })
    );

    app.use(notFound);
    app.use(errorHandler);
}