const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/authenticate:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: john.doe@email.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: Aa12345678
 *               rememberMe:
 *                 type: boolean
 *                 description: Remember user?
 *                 example: false
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The user ID.
 *                       example: 0
 *                     email:
 *                       type: string
 *                       description: The user's email.
 *                       example: john.doe@email.com
 *                     rememberMe:
 *                       type: boolean
 *                       description: Remember user?
 *                       example: false
*/
router.post('/', authController.authenticate);

/**
 * @swagger
 * /api/authenticate/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token using refresh token.
 *     description: Issues a new access token if the provided refresh token is valid. The refresh token must be sent as an HTTP-only cookie.
 *     responses:
 *       200:
 *         description: New access token issued successfully.
 *         headers:
 *           authorization:
 *             schema:
 *               type: string
 *             description: The new access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: New access token issued.
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR...
 *       401:
 *         description: No refresh token provided or user not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authorizationError:
 *                   type: string
 *                   example: No refresh token provided.
 *       403:
 *         description: Invalid or expired refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authorizationError:
 *                   type: string
 *                   example: Invalid or expired refresh token.
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/authenticate/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logs out the user.
 *     description: Clears the refresh token cookie to log the user out.
 *     responses:
 *       200:
 *         description: Successfully logged out.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully.
 */
router.post('/logout', auth.authUser, authController.logout);

module.exports = router;