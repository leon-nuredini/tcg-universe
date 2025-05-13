const { User } = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { authLogger } = require('../middleware/logger.middleware');

exports.authUser = async (req, res, next) => {
    const authHeader = req.header('authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ authorizationError: 'Access denied. No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;
        if (req.user.accountStatus !== 'active') return res.status(403).json({ authorizationError: `Account is ${req.user.accountStatus}` });
        next();
    } catch (error) {
        return res.status(403).json({ authorizationError: 'Invalid or expired access token' });
    }
}

exports.requireModerator = async (req, res, next) => {
    if (!req.user) return res.status(401).json({ authorizationError: 'Access denied' });
    const role = await getRole(req.user._id);
    if (role === 'user' ) return res.status(403).json({ authorizationError: 'Moderator privileges required' })
    next();
}

exports.requireAdmin = async (req, res, next) => {
    if (!req.user) return res.status(401).json({ authorizationError: 'Access denied' });
    const role = await getRole(req.user._id);
    if (role !== 'admin') return res.status(403).json({ authorizationError: 'Admin privileges required' })
    next();
}

const getRole = async (id) => {
    try {
        const user = await User.findById(id).lean();
        return user.role;
    } catch (error) {
        authLogger.error(`Error fetching the user role: ${error.message}`);
    }
}