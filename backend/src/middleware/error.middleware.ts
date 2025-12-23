import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class with status code
 */
export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not found handler
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
    const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
};

/**
 * Global error handler
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Default values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let stack: string | undefined;

    // Check if it's our custom error
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err.name === 'ValidationError') {
        // Mongoose validation error
        statusCode = 400;
        message = err.message;
    } else if (err.name === 'CastError') {
        // Invalid MongoDB ObjectId
        statusCode = 400;
        message = 'Invalid ID format';
    } else if ((err as any).code === 11000) {
        // MongoDB duplicate key error
        statusCode = 400;
        const field = Object.keys((err as any).keyValue)[0];
        message = `${field} already exists`;
    } else {
        message = err.message || message;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        stack = err.stack;
    }

    // Log error
    console.error(`❌ Error: ${message}`, {
        statusCode,
        path: req.path,
        method: req.method,
        stack: err.stack,
    });

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(stack && { stack }),
    });
};
