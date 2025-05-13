const mongoose = require('mongoose');
const userSeeder = require('../seeders/user.seeder')
const { logger } = require('../middleware/logger.middleware');

module.exports = function () {
    mongoose.connect(process.env.DB_URL).then(() => {
        logger.info('Connected to MongoDB tcg_marketplace database...');

        if (process.env.NODE_ENV === 'development') {
            console.log("RUNNING IN DEVELOPMENT MODE");
            //productSeeder.seedProducts();
            userSeeder.seedUsers();
        }
    }).catch(error => {
        logger.error(`Could not connect to MongoDB tcg_marketplace database: ${error.message}`);
        process.exit(1);
    });
}