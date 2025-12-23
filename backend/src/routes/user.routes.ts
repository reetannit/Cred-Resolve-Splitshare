import { Router } from 'express';
import { getUsers, getUserById, getUserBalanceSummary } from '../controllers';
import { authenticate, commonValidation, handleValidation } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 */
router.get('/:id', commonValidation.mongoId, handleValidation, getUserById);

/**
 * @swagger
 * /api/users/{id}/balances:
 *   get:
 *     summary: Get user's balance summary
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: Optional group ID to filter balances
 *     responses:
 *       200:
 *         description: Balance summary
 */
router.get('/:id/balances', commonValidation.mongoId, handleValidation, getUserBalanceSummary);

export default router;
