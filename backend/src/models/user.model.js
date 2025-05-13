const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: { type: String, required: true, minLength: 3, maxLength: 50 },
    email: { type: String, required: true, unique: true, maxLength: 100 },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'moderator'], required: true, default: 'user' },
    accountStatus: { type: String, enum: ['active', 'inactive', 'suspended'], required: true, default: 'active' },
    tokenVersion : { type: Number, default: 0 },
}, { timestamps: true });

userSchema.methods.generateAuthToken = function (rememberMe) {
    const expirationDuration = rememberMe ? '7d' : '15m' 
    return jwt.sign({ _id: this._id, accountStatus: this.accountStatus, tokenVersion: this.tokenVersion }, process.env.JWT_KEY, { expiresIn: expirationDuration });
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id, accountStatus: this.accountStatus, tokenVersion: this.tokenVersion }, process.env.JWT_REFRESH_KEY, { expiresIn: '7d' });
}

const User = mongoose.model('User', userSchema);

module.exports.User = User;
module.exports.userSchema = userSchema;