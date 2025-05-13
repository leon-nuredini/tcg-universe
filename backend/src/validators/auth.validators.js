const Joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

exports.validateAuth = function (req) {
    return Joi.object({
        email: Joi.string().email({ tlds: { allow: false } }),
        password: joiPassword.string().min(6).noWhiteSpaces().minOfUppercase(1).minOfLowercase(1).doesNotInclude(['password']).required(),
        rememberMe: Joi.boolean()
    }).validate(req);
}