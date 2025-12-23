import { Router } from 'express';
import {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
} from '../controllers';
import {
    authenticate,
    expenseValidation,
    commonValidation,
    handleValidation,
} from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, amount, paidBy, splitType, splits]
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               paidBy:
 *                 type: string
 *               groupId:
 *                 type: string
 *               splitType:
 *                 type: string
 *                 enum: [EQUAL, EXACT, PERCENTAGE]
 *               splits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     amount:
 *                       type: number
 *     responses:
 *       201:
 *         description: Expense created
 */
router.post('/', expenseValidation.create, handleValidation, createExpense);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses for current user
 *     tags: [Expenses]
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
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of expenses
 */
router.get('/', expenseValidation.list, handleValidation, getExpenses);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
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
 *         description: Expense data
 */
router.get('/:id', commonValidation.mongoId, handleValidation, getExpenseById);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               paidBy:
 *                 type: string
 *               splitType:
 *                 type: string
 *               splits:
 *                 type: array
 *     responses:
 *       200:
 *         description: Expense updated
 */
router.put('/:id', commonValidation.mongoId, handleValidation, updateExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete expense
 *     tags: [Expenses]
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
 *         description: Expense deleted
 */
router.delete('/:id', commonValidation.mongoId, handleValidation, deleteExpense);

export default router;
