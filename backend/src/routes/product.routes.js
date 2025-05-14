const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { uploadProductImages } = require('../middleware/upload.middleware');
const auth = require('../middleware/auth.middleware');
const asyncHandler = require('../middleware/asyncHandler.middleware');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API for managing trading card products
 */

/**
 * @swagger
 * components:
 *   schemas:
 * 
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
 * 
 *     Product:
 *       type: object
 *       required:
 *         - seller
 *         - name
 *         - image
 *         - description
 *         - category
 *         - price
 *         - quantity
 *         - condition
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier
 *         seller:
 *           type: string
 *           description: Seller unique identifier
 *         name:
 *           type: string
 *           description: Product name
 *         image:
 *           type: string
 *           format: uri
 *           description: Image URL
 *         description:
 *           type: string
 *           description: Product description
 *         brand:
 *           type: string
 *           description: Product brand
 *         category:
 *           type: string
 *           enum: [trading-card]
 *           description: Product category
 *         price:
 *           type: number
 *           description: Product price
 *         quantity:
 *           type: integer
 *           description: Available quantity
 *         reviews:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Review'
 *           description: Array of product reviews
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           description: Average rating
 *         reviewCount:
 *           type: integer
 *           description: Number of reviews
 *         condition:
 *           type: string
 *           enum: [new, used]
 *           description: Product condition
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get a paginated list of products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products per page
 *       - in: query
 *         name: seller
 *         schema:
 *           type: string
 *         description: Filter by seller id
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by product name (partial match)
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by product brand
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (e.g., trading-card)
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [new, used]
 *         description: Filter by condition
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Minimum rating filter
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *         description: Maximum rating filter
 *     responses:
 *       200:
 *         description: A list of products
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
 *                 totalProducts:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
router.get('/', asyncHandler(productController.getProducts));

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', asyncHandler(productController.getProductById));

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - image
 *               - description
 *               - category
 *               - price
 *               - quantity
 *               - condition
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               description:
 *                 type: string
 *               brand:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [trading-card]
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               condition:
 *                 type: string
 *                 enum: [new, used]
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', auth.authUser, uploadProductImages.single('image'), asyncHandler(productController.createProduct));

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               description:
 *                 type: string
 *               brand:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               rating:
 *                 type: number
 *               reviewCount:
 *                 type: integer
 *               condition:
 *                 type: string
 *                 enum: [new, used]
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', auth.authUser, uploadProductImages.single('image'), asyncHandler(productController.patchProduct));

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth.authUser, asyncHandler(productController.deleteProduct));

module.exports = router;