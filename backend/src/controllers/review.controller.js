const { Review } = require('../models/review.model');
const { Product } = require('../models/product.model');
const reviewValidators = require('../validators/review.validators');
const _ = require('lodash');
const { reviewLogger } = require('../middleware/logger.middleware');

exports.getProductReviews = async (req, res, next) => {
    req.logger = reviewLogger;

    const { productId } = req.params;

    const page = _.clamp(parseInt(req.query.page), 1, Number.MAX_SAFE_INTEGER);
    const limit = _.clamp(parseInt(req.query.limit), 1, Number.MAX_SAFE_INTEGER);
    const docsToSkip = (page - 1) * limit;

    const { user, minRating, maxRating, fromDate, toDate } = req.query;
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

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let filteredReviews = product.reviews || [];

    filteredReviews = _.filter(filteredReviews, (review) => {
        const userMatch = user ? new RegExp(user, 'i').test(review.user.toString()) : true;
        const minRatingMatch = minRating ? review.rating >= parseFloat(minRating) : true;
        const maxRatingMatch = maxRating ? review.rating <= parseFloat(maxRating) : true;
        const fromDateMatch = fromDate ? new Date(review.createdAt) >= new Date(fromDate) : true;
        const toDateMatch = toDate ? new Date(review.createdAt) <= new Date(toDate) : true;

        return userMatch && minRatingMatch && maxRatingMatch && fromDateMatch && toDateMatch;
    });

    const total = filteredReviews.length;
    filteredReviews = _.orderBy(filteredReviews, ['createdAt'], ['desc']);
    const paginatedReviews = _.slice(filteredReviews, docsToSkip, docsToSkip + limit);

    res.status(200).json({ total, page, limit, totalPages: Math.ceil(total / limit), rating: product.rating, reviews: paginatedReviews });
}

exports.createReview = async (req, res, next) => {
    const { productId } = req.body;
    req.logger = reviewLogger;
    const { error } = reviewValidators.validateReview(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        let product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const existingReview = product.reviews.find((r) => r.user.toString() == req.user._id.toString())
        if (existingReview) return res.status(400).json({ error: 'You have already submitted a review for this product' });

        const newReview = { ...req.body, user: req.user._id };
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
    const { reviewId, productId } = req.params;
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

        if (req.user._id.toString() !== review.user.toString()) {
            reviewLogger.warn(`User with id:${req.user._id} tried to edit the review with id:${reviewId} which is a review of the user with id:${review.user}`);
            return res.status(401).json({ authorizationError: 'Operation denied' });
        }

        updates.forEach(field => { review[field] = req.body[field] });
        const ratings = product.reviews.map(r => r._id.equals(reviewId) ? req.body.rating : r.rating);
        product.rating = (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);

        await product.save();
        res.status(200).json(review);
    } catch (error) {
        next(error);
    }
}

exports.deleteReview = async (req, res, next) => {
    const { reviewId, productId } = req.params;
    req.logger = reviewLogger;

    try {
        let product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const review = product.reviews.id(reviewId);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        if (req.user._id !== review.user.toString()) {
            reviewLogger.warn(`User with id:${req.user._id} tried to remove the review with id:${reviewId} which is a review of the user with id:${review.user}`);
            return res.status(401).json({ authorizationError: 'Operation denied' });
        }

        product.reviews.pull(reviewId);
        product.reviewCount = product.reviews.length;
        product.rating = product.reviewCount > 0 ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviewCount).toFixed(1) : 0;

        await product.save();
        res.status(200).json({ message: 'Review deleted' });

    } catch (error) {
        next(error);
    }
}