const { User } = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authLogger } = require('../middleware/logger.middleware');
const authValidator = require('../validators/auth.validators');

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FIFTEEN_MIN_MS = 15 * 60 * 1000;

const accessTokenCookieOptions = (rememberMe) => ({
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: rememberMe ? SEVEN_DAYS_MS : FIFTEEN_MIN_MS,
});

const refreshTokenCookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SEVEN_DAYS_MS,
}

exports.authenticate = async (req, res, next) => {
    req.logger = authLogger;
    const { rememberMe } = req.body;
    const { error } = authValidator.validateAuth(req.body);
    if (error) {
        authLogger.warn('Validation failed', { error: error.details[0].message });
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            authLogger.warn(`Login failed: user not found.   email:${req.body.email}`);
            return res.status(400).send({ authenticationError: `Invalid email or password.` });
        }

        if (user.accountStatus !== 'active') return res.status(403).json({ authenticationError: `Log in failed. Account is ${user.accountStatus}` });
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            authLogger.warn(`Login failed: invalid email or password.    userId:${user._id}  email:${req.body.email} password:${req.body.password}`);
            return res.status(400).json({ authenticationError: `Invalid email or password.` });
        }

        const accessToken = user.generateAuthToken(rememberMe);
        const refreshToken = user.generateRefreshToken();

        res.cookie('accessToken', accessToken, accessTokenCookieOptions(rememberMe));
        res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

        authLogger.info(`User logged in successfully: ${user._id}`);
        res.header('authorization', accessToken).status(200).json({ message: 'Tokens issued' });
    } catch (error) {
        next(error);
    }
}

exports.refreshToken = async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ authenticationError: 'No refresh token provided' });
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
        const user = await User.findById(decoded._id);
        if (!user) return res.status(401).json({ authenticationError: 'Invalid refresh token.' });
        if (user.accountStatus !== 'active') return res.status(403).json({ authenticationError: `Log in failed. Account is ${user.accountStatus}` });
        const newAccessToken = user.generateAuthToken(true);
        res.cookie('accessToken', newAccessToken, accessTokenCookieOptions(true));
        await user.save();
        authLogger.info(`Access token refreshed: ${user._id}`);
        res
            .header('authorization', newAccessToken)
            .status(200)
            .json({ message: 'New access token issued' });
    } catch (error) {
        next(error);
    }
}

exports.logout = async (req, res, next) => {
    const token = req.cookies?.refreshToken || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'No token provided' });
    res
        .clearCookie('accessToken', { httpOnly: true, sameSite: 'strict' })
        .clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' })
        .status(200)
        .json({ message: 'Logged out' });
}