const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

const passwordField = joiPassword.string()
    .min(6)
    .noWhiteSpaces()
    .minOfUppercase(1)
    .minOfLowercase(1)
    .doesNotInclude(['password']);

const baseFields = {
    name: Joi.string().min(3).max(50),
    email: Joi.string().email({ tlds: { allow: false } }),
    password: passwordField,
    role: Joi.string().valid('user', 'admin', 'moderator'),
    accountStatus: Joi.string().valid('active', 'inactive', 'suspended'),
    tokenVersion: Joi.number().min(0),
}

exports.validateUser = function (user) {
    return Joi.object({
        ...baseFields,
        name: baseFields.name.required(),
        email: baseFields.email.required(),
        password: baseFields.password.required(),
    }).validate(user);
}

exports.validatePatchUser = function (user) {
    return Joi.object({
        name: baseFields.name,
        email: baseFields.email,
        password: baseFields.password,
        accountStatus: Joi.string().valid('active', 'inactive')
    }).min(1).validate(user);
}

exports.validatePatchUserByAdmin = function (user) {
    return Joi.object({ ...baseFields }).validate(user);
}