import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { generateToken } from '../middleware';
import { AppError } from '../middleware';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('User with this email already exists', 400);
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
        });

        // Generate token
        const token = generateToken(user._id.toString(), user.email);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user with password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AppError('Invalid email or password', 401);
        }

        // Generate token
        const token = generateToken(user._id.toString(), user.email);

        res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = req.user!;

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};
