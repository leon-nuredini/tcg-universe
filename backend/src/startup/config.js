const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
require('dotenv-flow').config();
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

module.exports = function(app){
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        message: { error: "Too many requests. You can make up to 100 requests in 15 minutes. Please wait before trying again." },
        max: 100,
        skipFailedRequests: true,
    });

    const speedLimiter = slowDown({
        windowMs: 15 * 60 * 1000,
        delayAfter: 50,
        delayMs: (hits) => hits * 100
    });

    app.use(helmet());
    app.use(cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
    }));

    app.use(cookieParser());
    app.use(limiter);
    app.use(speedLimiter);

    if (!process.env.JWT_KEY){
        throw new Exception("FATAL ERROR: JWT_KEY is not defined!");
    }
}