const { User } = require('../models/user.model');
const userValidators = require('../validators/user.validators');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const { userLogger, moderatorLogger } = require('../middleware/logger.middleware');

async function genSalt() {
    return await bcrypt.genSalt(12);
}

exports.getUsers = async (req, res, next) => {
    req.logger = userLogger;

    const page = _.clamp(parseInt(req.query.page), 1, Number.MAX_SAFE_INTEGER);
    const limit = _.clamp(parseInt(req.query.limit), 1, Number.MAX_SAFE_INTEGER);
    const docsToSkip = (page - 1) * limit;

    const { name, email, role, accountStatus } = req.query;
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (role) filter.role = role;
    if (accountStatus) filter.accountStatus = accountStatus;
    const users = await User.find(filter).sort({ createdAt: -1 }).skip(docsToSkip).limit(limit).lean();
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);
    res.json({ page, limit, totalPages, totalUsers, users });
}

exports.getUserById = async (req, res, next) => {
    req.logger = userLogger;
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
}

exports.getUserProfile = async (req, res, next) => {
    req.logger = userLogger;
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
}

exports.createUser = async (req, res, next) => {
    req.logger = userLogger;
    const { error } = userValidators.validateUser(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const hashedPassword = await bcrypt.hash(req.body.password, await genSalt());
    const user = new User({ ...req.body, password: hashedPassword, role: 'user', accountStatus: 'active' });
    let result = await user.save();
    result = _.omit(result.toObject(), ['password']);
    res.status(201).json(result);
}

exports.patchUser = async (req, res, next) => {
    req.logger = userLogger;
    const allowedUpdates = ['name', 'email', 'password', 'accountStatus'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(field => allowedUpdates.includes(field));
    if (!isValidOperation) return res.status(400).json({ error: 'Invalid updates!' });

    const { error } = userValidators.validatePatchUser(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    let user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    updates.forEach(field => {
        user[field] = req.body[field]
    });
    if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, await genSalt());
        user.tokenVersion += 1;
    }
    await user.save();
    const safeUser = _.omit(user.toObject(), ['password']);
    res.json(safeUser);
}

exports.patchUserByAdmin = async (req, res, next) => {
    req.logger = userLogger;

    const allowedUpdates = ['name', 'email', 'password', 'role', 'accountStatus'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(field => allowedUpdates.includes(field));
    if (!isValidOperation) return res.status(400).json({ error: 'Invalid updates!' });

    const { error } = userValidators.validatePatchUserByAdmin(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    Object.keys(req.body).forEach(field => { user[field] = req.body[field]; });
    if (req.body.password) user.password = await bcrypt.hash(req.body.password, await genSalt());
    await user.save();
    moderatorLogger.info(`User   ${user._id} patched by  ${req.params.id}.    Fields affected: ${Object.keys(req.body)}.  New values: ${JSON.stringify({ ...req.body, password: req.body.password ? user.password : '' })}`);
    const safeUser = _.omit(user.toObject(), ['password']);
    res.json(safeUser);
}

exports.deleteUser = async (req, res, next) => {
    req.logger = userLogger;
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'User not found' });
    moderatorLogger.info(`User  ${result._id}   deleted by: ${req.user._id}`);
    res.json(result);
}