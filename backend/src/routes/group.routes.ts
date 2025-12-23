import { Router } from 'express';
import {
    createGroup,
    getGroups,
    getGroupById,
    addMember,
    removeMember,
    getGroupBalanceSummary,
} from '../controllers';
import { authenticate, groupValidation, handleValidation } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Group created
 */
router.post('/', groupValidation.create, handleValidation, createGroup);

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get all groups for current user
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 */
router.get('/', getGroups);

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Get group by ID
 *     tags: [Groups]
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
 *         description: Group data
 */
router.get('/:id', groupValidation.idParam, handleValidation, getGroupById);

/**
 * @swagger
 * /api/groups/{id}/members:
 *   post:
 *     summary: Add member to group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member added
 */
router.post(
    '/:id/members',
    groupValidation.idParam,
    groupValidation.addMember,
    handleValidation,
    addMember
);

/**
 * @swagger
 * /api/groups/{id}/members/{userId}:
 *   delete:
 *     summary: Remove member from group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed
 */
router.delete('/:id/members/:userId', groupValidation.idParam, handleValidation, removeMember);

/**
 * @swagger
 * /api/groups/{id}/balances:
 *   get:
 *     summary: Get group balances with settlement suggestions
 *     tags: [Groups]
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
 *         description: Group balance summary
 */
router.get('/:id/balances', groupValidation.idParam, handleValidation, getGroupBalanceSummary);

export default router;
