const mongoose = require('mongoose');
const { Review } = require('../models/review.model');
const { Product } = require('../models/product.model');
const reviewValidators = require('../validators/review.validators');
const _ = require('lodash');
const { reviewLogger } = require('../middleware/logger.middleware');

exports.getReviews = async (req, res, next) => {
    req.logger = reviewLogger;

    const page = _.clamp(parseInt(req.query.page), 1, Number.MAX_SAFE_INTEGER);
    const limit = _.clamp(parseInt(req.query.limit), 1, Number.MAX_SAFE_INTEGER);
    const docsToSkip = (page - 1) * limit;

    const { user, minRating, maxRating, fromDate, toDate  } = req.query;
    const filter = {};
    if (user) filter.user = { $regex: user, $options: 'i' };

    if (minRating || maxRating) {
        filter.rating = filter.rating || {};
        if (minRating) filter.rating.$gte = parseFloat(minRating);
        if (maxRating) filter.rating.$lte = parseFloat(maxRating);
    }

    if (fromDate || toDate) {
        filter.createdAt = {};
        if (fromDate) filter.createdAt.$gte = new Date(fromDate);
        if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    try {
        const reviews = await Review.find(filter).sort({ createdAt: -1 }).skip(docsToSkip).limit(limit).lean();
        const totalReviews = await Review.countDocuments(filter);
        const totalPages = Math.ceil(totalReviews / limit)
        res.json({ page, limit, totalPages, totalReviews, reviews });
    } catch (error) {
        next(error);
    }
}

exports.getReviewById = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid review ID' });
    req.logger = reviewLogger;
    try {
        const review = await Review.findById(req.params.id).lean();
        if (!review) return res.status(404).json({ error: 'Review not found' });
        res.json(review);
    } catch (error) {
        next(error);
    }
}

exports.createReview = async (req, res, next) => {
    const { productId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ error: 'Invalid product ID' });
    req.logger = reviewLogger;
    const { error } = reviewValidators.validateReview(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        let product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const newReview = { user: req.user._id, title, rating, comment };

        product.reviews.push(newReview);
        product.reviewCount = product.reviews.length;
        product.rating = (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviewCount).toFixed(1);
        await product.save();

        res.status(201).json(newReview);
    } catch (error) {
        next(error);
    }
}

exports.patchReview = async (req, res, next) => {
    const { productId, reviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ error: 'Invalid product ID' });
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return res.status(400).json({ error: 'Invalid review ID' });
    req.logger = reviewLogger;
    const allowedUpdates = ['title', 'rating', 'comment'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(field => allowedUpdates.includes(field));
    if (!isValidOperation) return res.status(400).json({ error: 'Invalid updates!' });

    const { error } = reviewValidators.validateReviewForPatching(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' })

        const review = product.reviews.id(reviewId);
        if (!review) return res.status(404).json({ error: 'Review not found' });
        
        if (req.user._id !== review.user) {
            reviewLogger.warn(`User with id:${req.user._id} tried to edit the review with id:${reviewId} which is a review of the user with id:${review.user}`);
            return res.status(401).json({ authorizationError: 'Operation denied' });
        }
        
        updates.forEach(field => { review[field] = req.body[field] });
        const ratings = product.reviews.map(r => r._id.equals(reviewId) ? rating : r.rating);
        product.rating = (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);

        await product.save();
        res.status(200).json(review);
    } catch (error) {
        next(error);
    }
}

exports.deleteReview = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid review ID' });
    req.logger = reviewLogger;
    try {
        const result = await Review.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ error: 'Review not found' });
        res.json(result);
    } catch (error) {
        next(error);
    }
}