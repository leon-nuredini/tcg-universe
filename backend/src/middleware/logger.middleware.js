const { createLogger } = require('../utils/logger.utils');

const logger = createLogger('GENERAL', 'combined');
const productLogger = createLogger('PRODUCT', 'product');
const fileLogger = createLogger('FILE', 'file');
const reviewLogger = createLogger('REVIEW', 'review');
const userLogger = createLogger('USER', 'user');
const moderatorLogger = createLogger('MODERATOR', 'moderator');
const authLogger = createLogger('AUTH', 'auth');

module.exports = { 
  logger,
  productLogger,
  fileLogger,
  reviewLogger,
  userLogger,
  moderatorLogger,
  authLogger
};