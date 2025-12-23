// Type definitions for the frontend

export enum SplitType {
    EQUAL = 'EQUAL',
    EXACT = 'EXACT',
    PERCENTAGE = 'PERCENTAGE',
}

export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
}

export interface Group {
    _id: string;
    name: string;
    description?: string;
    members: User[];
    createdBy: User;
    createdAt: string;
    updatedAt: string;
}

export interface Split {
    user: User;
    amount: number;
    share: number;
}

export interface Expense {
    _id: string;
    description: string;
    amount: number;
    paidBy: User;
    group?: Group;
    splitType: SplitType;
    splits: Split[];
    createdBy: User;
    createdAt: string;
    updatedAt: string;
}

export interface Settlement {
    _id: string;
    fromUser: User;
    toUser: User;
    amount: number;
    group?: Group;
    note?: string;
    createdAt: string;
}

export interface UserBalance {
    userId: string;
    userName: string;
    amount: number; // Positive = they owe you, Negative = you owe them
}

export interface BalanceSummary {
    totalOwed: number;
    totalOwing: number;
    netBalance: number;
    balances: UserBalance[];
}

export interface SettlementSuggestion {
    from: { userId: string; name: string };
    to: { userId: string; name: string };
    amount: number;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    count: number;
    total: number;
    page: number;
    pages: number;
}

// Auth types
export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

// Create types
export interface CreateExpenseData {
    description: string;
    amount: number;
    paidBy: string;
    groupId?: string;
    splitType: SplitType;
    splits: {
        userId: string;
        amount?: number;
    }[];
}

export interface CreateGroupData {
    name: string;
    description?: string;
    memberIds?: string[];
}

export interface CreateSettlementData {
    fromUserId: string;
    toUserId: string;
    amount: number;
    groupId?: string;
    note?: string;
}
