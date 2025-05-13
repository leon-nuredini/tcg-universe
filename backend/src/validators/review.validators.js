const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const baseFields = {
    user: Joi.objectId(),
    title: Joi.string().min(3).max(50),
    rating: Joi.number().min(0).max(5),
    comment: Joi.string().min(5).max(255)
}

exports.validateReview = function (review) {
    return Joi.object({
        ...baseFields,
        user: baseFields.user.required(),
        title: baseFields.title.required(),
        rating: baseFields.rating.required(),
        comment: baseFields.comment.required()
    }).validate(review);
}

exports.validateReviewForPatching = function (review) {
    return Joi.object({
        title: baseFields.title,
        rating: baseFields.rating,
        comment: baseFields.comment
    }).validate(review);
}