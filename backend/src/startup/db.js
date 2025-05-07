const mongoose = require('mongoose');
const { logger } = require('../middleware/logger.middleware');

module.exports = function () {
    mongoose.connect(process.env.DB_URL).then(() => {
        logger.info('Connected to MongoDB tcg_marketplace database...');
        //adminSeeder.seedAdmin();

        if (process.env.NODE_ENV === 'development') {
            productSeeder.seedProducts();
            //userSeeder.seedUsers();
        }
    }).catch(error => {
        logger.error(`Could not connect to MongoDB tcg_marketplace database: ${error.message}`);
        process.exit(1);
    });
}