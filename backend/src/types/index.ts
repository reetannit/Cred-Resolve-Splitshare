// Type definitions for the Expense Sharing Application

import { Document, Types } from 'mongoose';

// ============ Enums ============
export enum SplitType {
    EQUAL = 'EQUAL',
    EXACT = 'EXACT',
    PERCENTAGE = 'PERCENTAGE'
}

export enum TransactionType {
    EXPENSE = 'EXPENSE',
    SETTLEMENT = 'SETTLEMENT'
}

// ============ User Types ============
export interface IUser {
    name: string;
    email: string;
    password: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
    _id: Types.ObjectId;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserResponse {
    _id: string;
    name: string;
    email: string;
    phone?: string;
}

// ============ Group Types ============
export interface IGroup {
    name: string;
    description?: string;
    members: Types.ObjectId[];
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IGroupDocument extends IGroup, Document {
    _id: Types.ObjectId;
}

// ============ Expense Types ============
export interface ISplit {
    user: Types.ObjectId;
    amount: number; // For EXACT: actual amount, For PERCENTAGE: percentage value
    share: number;  // Calculated share in currency (paise/cents)
}

export interface IExpense {
    description: string;
    amount: number; // Total amount in smallest unit (paise/cents)
    paidBy: Types.ObjectId;
    group?: Types.ObjectId;
    splitType: SplitType;
    splits: ISplit[];
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IExpenseDocument extends IExpense, Document {
    _id: Types.ObjectId;
}

// ============ Balance Types ============
export interface IBalance {
    fromUser: Types.ObjectId;
    toUser: Types.ObjectId;
    amount: number; // Net amount owed (can be negative)
    group?: Types.ObjectId;
    updatedAt: Date;
}

export interface IBalanceDocument extends IBalance, Document {
    _id: Types.ObjectId;
}

// ============ Settlement Types ============
export interface ISettlement {
    fromUser: Types.ObjectId;
    toUser: Types.ObjectId;
    amount: number;
    group?: Types.ObjectId;
    note?: string;
    createdAt: Date;
}

export interface ISettlementDocument extends ISettlement, Document {
    _id: Types.ObjectId;
}

// ============ API Request Types ============
export interface CreateExpenseRequest {
    description: string;
    amount: number;
    paidBy: string;
    groupId?: string;
    splitType: SplitType;
    splits: {
        userId: string;
        amount?: number; // For EXACT or PERCENTAGE
    }[];
}

export interface CreateGroupRequest {
    name: string;
    description?: string;
    memberIds: string[];
}

export interface CreateSettlementRequest {
    fromUserId: string;
    toUserId: string;
    amount: number;
    groupId?: string;
    note?: string;
}

// ============ API Response Types ============
export interface BalanceSummary {
    userId: string;
    userName: string;
    totalOwed: number;    // What others owe this user
    totalOwing: number;   // What this user owes others
    netBalance: number;   // Positive = others owe, Negative = user owes
}

export interface DetailedBalance {
    otherUser: IUserResponse;
    amount: number; // Positive = they owe you, Negative = you owe them
}

export interface SettlementSuggestion {
    from: IUserResponse;
    to: IUserResponse;
    amount: number;
}

// ============ JWT Types ============
export interface JWTPayload {
    userId: string;
    email: string;
}

// ============ Express Extensions ============
declare global {
    namespace Express {
        interface Request {
            user?: IUserDocument;
        }
    }
}
