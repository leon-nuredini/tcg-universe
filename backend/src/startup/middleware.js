const productErrorMiddleware = require('../middleware/error.middleware');

module.exports = function (app) {
    app.use(productErrorMiddleware);
}