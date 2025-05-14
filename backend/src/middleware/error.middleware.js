const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

const errorHandler = (err, req, res, next) => {
    const logger = req.logger;
    if (logger) logger.error(`${err.name}: ${err.message}`);
    let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    let message = err.message;

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found'
    }

    res.status(statusCode).json({ 
        error: message || 'Internal server error',
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
}

module.exports.notFound = notFound;
module.exports.errorHandler = errorHandler;