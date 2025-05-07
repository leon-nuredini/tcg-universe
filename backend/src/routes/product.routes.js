const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { uploadProductImages } = require('../middleware/upload.middleware');

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
 *     Product:
 *       type: object
 *       required:
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
 *         name:
 *           type: string
 *         image:
 *           type: string
 *           format: uri
 *         description:
 *           type: string
 *         brand:
 *           type: string
 *         category:
 *           type: string
 *           enum: [trading-card]
 *         price:
 *           type: number
 *         quantity:
 *           type: integer
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         reviewCount:
 *           type: integer
 *         condition:
 *           type: string
 *           enum: [new, used]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [new, used]
 *     responses:
 *       200:
 *         description: List of products
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
 */
router.get('/', productController.getProducts);

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
 */
router.get('/:id', productController.getProductById);

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
 *           encoding:
 *             image:
 *               contentType: image/png, image/jpeg
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 */
router.post('/', uploadProductImages.single('image'), productController.createProduct);

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
 *           encoding:
 *             image:
 *               contentType: image/png, image/jpeg
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 */
router.patch('/:id', uploadProductImages.single('image'), productController.patchProduct);

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
 */
router.delete('/:id', productController.deleteProduct);

module.exports = router;