import { Request, Response, NextFunction } from 'express';
import { Expense, Group, User } from '../models';
import { calculateSplits } from '../utils';
import { AppError } from '../middleware';
import { SplitType } from '../types';
import { Types } from 'mongoose';

/**
 * Create a new expense
 * POST /api/expenses
 */
export const createExpense = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { description, amount, paidBy, groupId, splitType, splits } = req.body;
        const userId = req.user!._id;

        // Validate payer exists
        const payer = await User.findById(paidBy);
        if (!payer) {
            throw new AppError('Payer not found', 404);
        }

        // If group expense, validate group and membership
        if (groupId) {
            const group = await Group.findById(groupId);
            if (!group) {
                throw new AppError('Group not found', 404);
            }

            // Check all split users are group members
            for (const split of splits) {
                if (!group.members.some((m) => m.equals(new Types.ObjectId(split.userId)))) {
                    throw new AppError(
                        `User ${split.userId} is not a member of this group`,
                        400
                    );
                }
            }

            // Check payer is a group member
            if (!group.members.some((m) => m.equals(new Types.ObjectId(paidBy)))) {
                throw new AppError('Payer must be a member of the group', 400);
            }
        }

        // Calculate splits based on type
        const calculatedSplits = calculateSplits(
            amount,
            splitType as SplitType,
            splits.map((s: any) => ({ userId: s.userId, amount: s.amount }))
        );

        // Create expense
        const expense = await Expense.create({
            description,
            amount,
            paidBy,
            group: groupId || undefined,
            splitType,
            splits: calculatedSplits,
            createdBy: userId,
        });

        // Populate and return
        await expense.populate('paidBy', 'name email');
        await expense.populate('splits.user', 'name email');
        if (groupId) {
            await expense.populate('group', 'name');
        }

        res.status(201).json({
            success: true,
            data: expense,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all expenses (with optional filters)
 * GET /api/expenses
 */
export const getExpenses = async (
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
                { paidBy: userId },
                { 'splits.user': userId },
                { createdBy: userId },
            ],
        };

        if (groupId) {
            query.group = groupId;
        }

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);

        const [expenses, total] = await Promise.all([
            Expense.find(query)
                .populate('paidBy', 'name email')
                .populate('splits.user', 'name email')
                .populate('group', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Expense.countDocuments(query),
        ]);

        res.json({
            success: true,
            count: expenses.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: expenses,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get expense by ID
 * GET /api/expenses/:id
 */
export const getExpenseById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const expense = await Expense.findById(req.params.id)
            .populate('paidBy', 'name email')
            .populate('splits.user', 'name email')
            .populate('group', 'name')
            .populate('createdBy', 'name email');

        if (!expense) {
            res.status(404).json({
                success: false,
                error: 'Expense not found',
            });
            return;
        }

        res.json({
            success: true,
            data: expense,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update expense
 * PUT /api/expenses/:id
 */
export const updateExpense = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { description, amount, paidBy, splitType, splits } = req.body;

        // Find expense
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            res.status(404).json({
                success: false,
                error: 'Expense not found',
            });
            return;
        }

        // Check if user created the expense
        if (!expense.createdBy.equals(req.user!._id)) {
            res.status(403).json({
                success: false,
                error: 'Only the creator can update this expense',
            });
            return;
        }

        // Recalculate splits if amount or split type changed
        if (amount || splitType || splits) {
            const newAmount = amount || expense.amount;
            const newSplitType = splitType || expense.splitType;
            const newSplitInput = splits || expense.splits.map((s) => ({
                userId: s.user.toString(),
                amount: s.amount,
            }));

            const calculatedSplits = calculateSplits(
                newAmount,
                newSplitType as SplitType,
                newSplitInput
            );

            expense.amount = newAmount;
            expense.splitType = newSplitType;
            expense.splits = calculatedSplits;
        }

        if (description) expense.description = description;
        if (paidBy) expense.paidBy = paidBy;

        await expense.save();

        // Populate and return
        await expense.populate('paidBy', 'name email');
        await expense.populate('splits.user', 'name email');
        await expense.populate('group', 'name');

        res.json({
            success: true,
            data: expense,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete expense
 * DELETE /api/expenses/:id
 */
export const deleteExpense = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            res.status(404).json({
                success: false,
                error: 'Expense not found',
            });
            return;
        }

        // Check if user created the expense
        if (!expense.createdBy.equals(req.user!._id)) {
            res.status(403).json({
                success: false,
                error: 'Only the creator can delete this expense',
            });
            return;
        }

        await expense.deleteOne();

        res.json({
            success: true,
            message: 'Expense deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
