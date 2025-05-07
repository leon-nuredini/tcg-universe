const { createLogger } = require('../utils/logger.utils');

const logger = createLogger('GENERAL', 'combined');
const productLogger = createLogger('PRODUCT', 'product');
const fileLogger = createLogger('FILE', 'file');

module.exports = { 
  logger,
  productLogger,
  fileLogger
};