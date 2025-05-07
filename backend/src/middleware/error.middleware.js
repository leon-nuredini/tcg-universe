const logger = require('./logger.middleware');

module.exports = function (ex, req, res, next) {
    logger.error(ex.message, ex);
    res.status(500).send(ex.message);
}