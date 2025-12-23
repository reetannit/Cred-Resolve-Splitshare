import { Router } from 'express';
import {
    createSettlement,
    getSettlements,
    getSuggestions,
    confirmSettlement,
    rejectSettlement,
    getPendingSettlements
} from '../controllers';
import { authenticate, settlementValidation, handleValidation } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/settlements:
 *   post:
 *     summary: Record a settlement payment (requires creditor confirmation)
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
 *         description: Settlement recorded (pending confirmation)
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
 * /api/settlements/pending:
 *   get:
 *     summary: Get pending settlements requiring your confirmation
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending settlements
 */
router.get('/pending', getPendingSettlements);

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

/**
 * @swagger
 * /api/settlements/{id}/confirm:
 *   patch:
 *     summary: Confirm a settlement (creditor only)
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Settlement ID
 *     responses:
 *       200:
 *         description: Settlement confirmed
 *       403:
 *         description: Only the receiver can confirm
 */
router.patch('/:id/confirm', confirmSettlement);

/**
 * @swagger
 * /api/settlements/{id}/reject:
 *   patch:
 *     summary: Reject a settlement (creditor only)
 *     tags: [Settlements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Settlement ID
 *     responses:
 *       200:
 *         description: Settlement rejected
 *       403:
 *         description: Only the receiver can reject
 */
router.patch('/:id/reject', rejectSettlement);

export default router;

