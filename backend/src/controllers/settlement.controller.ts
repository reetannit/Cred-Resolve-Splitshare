import { Request, Response, NextFunction } from 'express';
import { Settlement, User, Group } from '../models';
import { getSettlementSuggestions } from '../services';
import { AppError } from '../middleware';
import { Types } from 'mongoose';

/**
 * Create a settlement (record a payment)
 * POST /api/settlements
 */
export const createSettlement = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { fromUserId, toUserId, amount, groupId, note } = req.body;

        // Validate users exist
        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);

        if (!fromUser) {
            throw new AppError('Payer user not found', 404);
        }
        if (!toUser) {
            throw new AppError('Receiver user not found', 404);
        }

        // Can't settle with yourself
        if (fromUserId === toUserId) {
            throw new AppError('Cannot settle with yourself', 400);
        }

        // If group settlement, validate group
        if (groupId) {
            const group = await Group.findById(groupId);
            if (!group) {
                throw new AppError('Group not found', 404);
            }

            // Check both users are group members
            if (!group.members.some((m) => m.equals(new Types.ObjectId(fromUserId)))) {
                throw new AppError('Payer is not a member of this group', 400);
            }
            if (!group.members.some((m) => m.equals(new Types.ObjectId(toUserId)))) {
                throw new AppError('Receiver is not a member of this group', 400);
            }
        }

        // Create settlement
        const settlement = await Settlement.create({
            fromUser: fromUserId,
            toUser: toUserId,
            amount,
            group: groupId || undefined,
            note,
        });

        // Populate and return
        await settlement.populate('fromUser', 'name email');
        await settlement.populate('toUser', 'name email');
        if (groupId) {
            await settlement.populate('group', 'name');
        }

        res.status(201).json({
            success: true,
            data: settlement,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all settlements for current user
 * GET /api/settlements
 */
export const getSettlements = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!._id;
        const { groupId, page = 1, limit = 20 } = req.query;

        // Build query
        const query: any = {
            $or: [
                { fromUser: userId },
                { toUser: userId },
            ],
        };

        if (groupId) {
            query.group = groupId;
        }

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);

        const [settlements, total] = await Promise.all([
            Settlement.find(query)
                .populate('fromUser', 'name email')
                .populate('toUser', 'name email')
                .populate('group', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Settlement.countDocuments(query),
        ]);

        res.json({
            success: true,
            count: settlements.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: settlements,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get optimized settlement suggestions for a group
 * GET /api/settlements/suggestions
 */
export const getSuggestions = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { groupId } = req.query;

        if (!groupId) {
            throw new AppError('groupId is required', 400);
        }

        // Verify group exists and user is a member
        const group = await Group.findById(groupId);
        if (!group) {
            throw new AppError('Group not found', 404);
        }

        if (!group.members.some((m) => m.equals(req.user!._id))) {
            throw new AppError('You are not a member of this group', 403);
        }

        // Get optimized settlements
        const suggestions = await getSettlementSuggestions(groupId as string);

        res.json({
            success: true,
            data: {
                groupId,
                optimizedSettlements: suggestions.map((s) => ({
                    from: { userId: s.from.userId, name: s.from.userName },
                    to: { userId: s.to.userId, name: s.to.userName },
                    amount: s.amount,
                })),
                totalTransactions: suggestions.length,
            },
        });
    } catch (error) {
        next(error);
    }
};
