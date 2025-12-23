import { Router } from 'express';
import { createSettlement, getSettlements, getSuggestions } from '../controllers';
import { authenticate, settlementValidation, handleValidation } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/settlements:
 *   post:
 *     summary: Record a settlement payment
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fromUserId, toUserId, amount]
 *             properties:
 *               fromUserId:
 *                 type: string
 *               toUserId:
 *                 type: string
 *               amount:
 *                 type: number
 *               groupId:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Settlement recorded
 */
router.post('/', settlementValidation.create, handleValidation, createSettlement);

/**
 * @swagger
 * /api/settlements:
 *   get:
 *     summary: Get all settlements for current user
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: Filter by group
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of settlements
 */
router.get('/', getSettlements);

/**
 * @swagger
 * /api/settlements/suggestions:
 *   get:
 *     summary: Get optimized settlement suggestions
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID to get suggestions for
 *     responses:
 *       200:
 *         description: Optimized settlement suggestions
 */
router.get('/suggestions', getSuggestions);

export default router;
