import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Authentication middleware - verifies JWT token and attaches user to request
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.',
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(401).json({
                success: false,
                error: 'User not found. Token may be invalid.',
            });
            return;
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: 'Token expired. Please login again.',
            });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: 'Invalid token.',
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'Authentication failed.',
        });
    }
};

/**
 * Generate JWT token for a user
 */
export const generateToken = (userId: string, email: string): string => {
    return jwt.sign(
        { userId, email } as JWTPayload,
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};
