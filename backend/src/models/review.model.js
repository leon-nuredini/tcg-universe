const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, minLength: 3, maxLength: 50 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, required: true, minLength: 5, maxLength: 255 },
}, { timestamps: true} );

const Review = mongoose.model('Review', reviewSchema);

module.exports.Review = Review;
module.exports.reviewSchema = reviewSchema;