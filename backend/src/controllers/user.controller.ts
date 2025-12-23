import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { getUserBalances } from '../services';

/**
 * Get all users (for adding to groups)
 * GET /api/users
 */
export const getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const users = await User.find().select('name email phone');

        res.json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await User.findById(req.params.id).select('name email phone createdAt');

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's balance summary
 * GET /api/users/:id/balances
 */
export const getUserBalanceSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const { groupId } = req.query;

        // Verify user exists
        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        const balanceSummary = await getUserBalances(
            id,
            groupId as string | undefined
        );

        res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                },
                ...balanceSummary,
            },
        });
    } catch (error) {
        next(error);
    }
};
