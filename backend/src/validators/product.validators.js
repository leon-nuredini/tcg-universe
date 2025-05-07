const Joi = require('joi');

const baseFields = {
    name: Joi.string().min(3).max(255),
    image: Joi.string(),
    description: Joi.string().min(3).max(1000),
    brand: Joi.string().min(3).max(255),
    category: Joi.string().valid('trading-card'),
    price: Joi.number().greater(0),
    quantity: Joi.number().greater(0),
    rating: Joi.number().min(0).max(5),
    reviewCount: Joi.number().min(0),
    condition: Joi.string().valid('new', 'used'),
    createdAt: Joi.date(),
    updatedAt: Joi.date()
}

exports.validateProduct = function (product) {
    return Joi.object({
        ...baseFields,
        name: baseFields.name.required(),
        image: baseFields.image.required(),
        description: baseFields.description.required(),
        category: baseFields.category.required(),
        price: baseFields.price.required(),
        quantity: baseFields.quantity.required(),
    }).validate(product);
}

exports.validateProductForPatching = function (product) {
    return Joi.object({
        ...baseFields
    }).validate(product);
}
