import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 */
export const handleValidation = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array().map((err) => ({
                field: err.type === 'field' ? err.path : 'unknown',
                message: err.msg,
            })),
        });
        return;
    }

    next();
};
