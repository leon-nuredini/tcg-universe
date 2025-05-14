const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: API for managing trading card reviews
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - user
 *         - title
 *         - rating
 *         - comment
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier
 *         user:
 *           type: string
 *           example: "6618b8f933b7a84cda74df01"
 *         title:
 *           type: string
 *           example: "Great Product"
 *         rating:
 *           type: number
 *           format: float
 *           example: 4.5
 *         comment:
 *           type: string
 *           example: "Loved using this every day!"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/reviews/{productId}:
 *   get:
 *     summary: Get all reviews (with filters and pagination)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Minimum rating
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *         description: Maximum rating
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter reviews created after this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter reviews created before this date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalReviews:
 *                   type: integer
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 */
router.get('/:productId', reviewController.getProductReviews);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - title
 *               - rating
 *               - comment
 *             properties:
 *               productId:
 *                 type: string
 *               title:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error
 */
router.post('/', auth.authUser, reviewController.createReview);

/**
 * @swagger
 * /api/reviews/{reviewId}/product/{productId}:
 *   patch:
 *     summary: Update a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid input or update
 *       404:
 *         description: Review not found
 */
router.patch('/:reviewId/product/:productId', auth.authUser, reviewController.patchReview);

/**
 * @swagger
 * /api/reviews/{reviewId}/product/{productId}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 *       404:
 *         description: Review not found
 */
router.delete('/:reviewId/product/:productId', auth.authUser, reviewController.deleteReview);

module.exports = router;
