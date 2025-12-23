import { Request, Response, NextFunction } from 'express';
import { Group, User } from '../models';
import { getGroupBalances, getSettlementSuggestions } from '../services';
import { AppError } from '../middleware';
import { Types } from 'mongoose';

/**
 * Create a new group
 * POST /api/groups
 */
export const createGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, description, memberIds = [] } = req.body;
        const userId = req.user!._id;

        // Validate member IDs exist
        if (memberIds.length > 0) {
            const validMembers = await User.find({ _id: { $in: memberIds } });
            if (validMembers.length !== memberIds.length) {
                throw new AppError('One or more member IDs are invalid', 400);
            }
        }

        // Create group (creator is automatically added as member in pre-save hook)
        const group = await Group.create({
            name,
            description,
            members: [userId, ...memberIds.filter((id: string) => id !== userId.toString())],
            createdBy: userId,
        });

        // Populate members
        await group.populate('members', 'name email');
        await group.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            data: group,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all groups for current user
 * GET /api/groups
 */
export const getGroups = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!._id;

        const groups = await Group.find({ members: userId })
            .populate('members', 'name email')
            .populate('createdBy', 'name email')
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            count: groups.length,
            data: groups,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get group by ID
 * GET /api/groups/:id
 */
export const getGroupById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'name email')
            .populate('createdBy', 'name email');

        if (!group) {
            res.status(404).json({
                success: false,
                error: 'Group not found',
            });
            return;
        }

        // Check if user is a member
        const userId = req.user!._id;
        if (!group.members.some((m: any) => m._id.equals(userId))) {
            res.status(403).json({
                success: false,
                error: 'You are not a member of this group',
            });
            return;
        }

        res.json({
            success: true,
            data: group,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add member to group
 * POST /api/groups/:id/members
 */
export const addMember = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { userId } = req.body;
        const groupId = req.params.id;

        // Find group
        const group = await Group.findById(groupId);
        if (!group) {
            res.status(404).json({
                success: false,
                error: 'Group not found',
            });
            return;
        }

        // Check if requester is a member
        if (!group.members.some((m) => m.equals(req.user!._id))) {
            res.status(403).json({
                success: false,
                error: 'You are not a member of this group',
            });
            return;
        }

        // Check if user exists
        const newMember = await User.findById(userId);
        if (!newMember) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        // Check if already a member
        if (group.members.some((m) => m.equals(new Types.ObjectId(userId)))) {
            res.status(400).json({
                success: false,
                error: 'User is already a member of this group',
            });
            return;
        }

        // Add member
        group.members.push(new Types.ObjectId(userId));
        await group.save();

        // Populate and return
        await group.populate('members', 'name email');
        await group.populate('createdBy', 'name email');

        res.json({
            success: true,
            data: group,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove member from group
 * DELETE /api/groups/:id/members/:userId
 */
export const removeMember = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id: groupId, userId } = req.params;

        // Find group
        const group = await Group.findById(groupId);
        if (!group) {
            res.status(404).json({
                success: false,
                error: 'Group not found',
            });
            return;
        }

        // Check if requester is the creator
        if (!group.createdBy.equals(req.user!._id)) {
            res.status(403).json({
                success: false,
                error: 'Only the group creator can remove members',
            });
            return;
        }

        // Can't remove the creator
        if (group.createdBy.equals(new Types.ObjectId(userId))) {
            res.status(400).json({
                success: false,
                error: 'Cannot remove the group creator',
            });
            return;
        }

        // Remove member
        group.members = group.members.filter((m) => !m.equals(new Types.ObjectId(userId)));
        await group.save();

        // Populate and return
        await group.populate('members', 'name email');
        await group.populate('createdBy', 'name email');

        res.json({
            success: true,
            data: group,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get group balances
 * GET /api/groups/:id/balances
 */
export const getGroupBalanceSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const groupId = req.params.id;

        // Verify group exists and user is a member
        const group = await Group.findById(groupId);
        if (!group) {
            res.status(404).json({
                success: false,
                error: 'Group not found',
            });
            return;
        }

        if (!group.members.some((m) => m.equals(req.user!._id))) {
            res.status(403).json({
                success: false,
                error: 'You are not a member of this group',
            });
            return;
        }

        // Get simplified settlement suggestions
        const settlements = await getSettlementSuggestions(groupId);

        res.json({
            success: true,
            data: {
                groupId,
                settlementSuggestions: settlements.map((s) => ({
                    from: { userId: s.from.userId, name: s.from.userName },
                    to: { userId: s.to.userId, name: s.to.userName },
                    amount: s.amount,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
};
