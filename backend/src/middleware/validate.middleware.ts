import { body, param, query, ValidationChain } from 'express-validator';
import { SplitType } from '../types';

/**
 * Validation rules for authentication
 */
export const authValidation = {
    register: [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('phone')
            .optional()
            .matches(/^[0-9]{10}$/).withMessage('Phone must be a 10-digit number'),
    ] as ValidationChain[],

    login: [
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format'),
        body('password')
            .notEmpty().withMessage('Password is required'),
    ] as ValidationChain[],
};

/**
 * Validation rules for groups
 */
export const groupValidation = {
    create: [
        body('name')
            .trim()
            .notEmpty().withMessage('Group name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
        body('memberIds')
            .optional()
            .isArray().withMessage('memberIds must be an array'),
        body('memberIds.*')
            .optional()
            .isMongoId().withMessage('Invalid member ID'),
    ] as ValidationChain[],

    addMember: [
        body('userId')
            .notEmpty().withMessage('User ID is required')
            .isMongoId().withMessage('Invalid user ID'),
    ] as ValidationChain[],

    idParam: [
        param('id')
            .isMongoId().withMessage('Invalid group ID'),
    ] as ValidationChain[],
};

/**
 * Validation rules for expenses
 */
export const expenseValidation = {
    create: [
        body('description')
            .trim()
            .notEmpty().withMessage('Description is required')
            .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
        body('amount')
            .notEmpty().withMessage('Amount is required')
            .isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
        body('paidBy')
            .notEmpty().withMessage('Payer is required')
            .isMongoId().withMessage('Invalid payer ID'),
        body('groupId')
            .optional()
            .isMongoId().withMessage('Invalid group ID'),
        body('splitType')
            .notEmpty().withMessage('Split type is required')
            .isIn(Object.values(SplitType)).withMessage('Invalid split type'),
        body('splits')
            .isArray({ min: 1 }).withMessage('At least one split is required'),
        body('splits.*.userId')
            .notEmpty().withMessage('User ID is required in each split')
            .isMongoId().withMessage('Invalid user ID in split'),
        body('splits.*.amount')
            .optional()
            .isFloat({ min: 0 }).withMessage('Split amount must be non-negative'),
    ] as ValidationChain[],

    list: [
        query('groupId')
            .optional()
            .isMongoId().withMessage('Invalid group ID'),
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    ] as ValidationChain[],
};

/**
 * Validation rules for settlements
 */
export const settlementValidation = {
    create: [
        body('fromUserId')
            .notEmpty().withMessage('Payer ID is required')
            .isMongoId().withMessage('Invalid payer ID'),
        body('toUserId')
            .notEmpty().withMessage('Receiver ID is required')
            .isMongoId().withMessage('Invalid receiver ID'),
        body('amount')
            .notEmpty().withMessage('Amount is required')
            .isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
        body('groupId')
            .optional()
            .isMongoId().withMessage('Invalid group ID'),
        body('note')
            .optional()
            .trim()
            .isLength({ max: 200 }).withMessage('Note cannot exceed 200 characters'),
    ] as ValidationChain[],
};

/**
 * Common validations
 */
export const commonValidation = {
    mongoId: [
        param('id')
            .isMongoId().withMessage('Invalid ID format'),
    ] as ValidationChain[],
};
