module.exports = function (err, req, res, next) {
    const logger = req.logger;
    if (logger) logger.error(`${err.name}: ${err.message}`);
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({ error: err.message || 'Internal server error' })
}