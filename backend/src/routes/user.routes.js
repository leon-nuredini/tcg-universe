const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const asyncHandler = require('../middleware/asyncHandler.middleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [user, admin, moderator]
 *         accountStatus:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateUser:
 *       type: object
 *       required: [name, email, password, role]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *
 *     PatchUser:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin, moderator]
 *
 *     PatchUserByAdmin:
 *       allOf:
 *         - $ref: '#/components/schemas/PatchUser'
 *         - type: object
 *           properties:
 *             role:
 *               type: string
 *               enum: [user, admin, moderator]
 *             accountStatus:
 *               type: string
 *               enum: [active, inactive, suspended]
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get list of users with optional filters
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Results per page
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: accountStatus
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', auth.authUser, auth.requireAdmin, asyncHandler(userController.getUsers));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/:id', auth.authUser, auth.requireAdmin, asyncHandler(userController.getUserById));

/**
 * @swagger
 * /api/users/profile/user:
 *   get:
 *     summary: Get logged in user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/profile/user', auth.authUser, asyncHandler(userController.getUserProfile));

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/', asyncHandler(userController.createUser));

/**
 * @swagger
 * /api/users/:
 *   patch:
 *     summary: Partially update a user (self-edit)
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatchUser'
 *     responses:
 *       200:
 *         description: User updated
 */
router.patch('/', auth.authUser, asyncHandler(userController.patchUser));

/**
 * @swagger
 * /api/users/admin/{id}:
 *   patch:
 *     summary: Partially update a user (admin/moderator access)
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatchUserByAdmin'
 *     responses:
 *       200:
 *         description: User updated by admin
 */
router.patch('/admin/:id', auth.authUser, auth.requireAdmin, asyncHandler(userController.patchUserByAdmin));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/:id', auth.authUser, auth.requireAdmin, asyncHandler(userController.deleteUser));

module.exports = router;