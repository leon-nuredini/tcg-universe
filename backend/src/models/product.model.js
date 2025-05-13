const mongoose = require('mongoose');
const { reviewSchema } = require('./review.model');

const productSchema = mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, minLength: 3, maxLength: 255 },
    image: { type: String, required: true },
    description: { type: String, required: true, minLength: 3, maxLength: 1000 },
    brand: { type: String, minLength: 3, maxLength: 255 },
    category: { type: String, enum:['trading-card']  , required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    reviews: { type: [reviewSchema] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    condition: { type: String, enum: ['new', 'used'], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

module.exports.Product = Product;
module.exports.productSchema = productSchema;