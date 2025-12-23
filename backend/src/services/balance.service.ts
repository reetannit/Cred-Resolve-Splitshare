/**
 * Balance Service
 * 
 * Handles computation and tracking of balances between users.
 */

import { Expense, Settlement, User } from '../models';
import { Types } from 'mongoose';
import { getSimplifiedSettlements, OptimizedSettlement } from '../utils/balanceSimplifier';

export interface UserBalance {
    userId: string;
    userName: string;
    amount: number; // Positive = they owe you, Negative = you owe them
}

export interface BalanceSummary {
    totalOwed: number;    // What others owe you
    totalOwing: number;   // What you owe others
    netBalance: number;   // Net (positive = you're owed, negative = you owe)
    balances: UserBalance[];
}

/**
 * Calculate balances for a user across all groups or a specific group
 */
export async function getUserBalances(
    userId: string,
    groupId?: string
): Promise<BalanceSummary> {
    const userObjectId = new Types.ObjectId(userId);

    // Build match query
    const matchQuery: any = {
        $or: [
            { paidBy: userObjectId },
            { 'splits.user': userObjectId },
        ],
    };

    if (groupId) {
        matchQuery.group = new Types.ObjectId(groupId);
    }

    // Get all relevant expenses
    const expenses = await Expense.find(matchQuery)
        .populate('paidBy', 'name')
        .populate('splits.user', 'name');

    // Get all settlements
    const settlementMatch: any = {
        $or: [
            { fromUser: userObjectId },
            { toUser: userObjectId },
        ],
    };

    if (groupId) {
        settlementMatch.group = new Types.ObjectId(groupId);
    }

    const settlements = await Settlement.find(settlementMatch)
        .populate('fromUser', 'name')
        .populate('toUser', 'name');

    // Calculate balance with each user
    const balanceMap = new Map<string, { name: string; amount: number }>();

    // Process expenses
    for (const expense of expenses) {
        const payerId = (expense.paidBy as any)._id.toString();
        const payerName = (expense.paidBy as any).name;

        for (const split of expense.splits) {
            const splitUserId = (split.user as any)._id.toString();
            const splitUserName = (split.user as any).name;

            if (payerId === userId && splitUserId !== userId) {
                // I paid, they owe me
                if (!balanceMap.has(splitUserId)) {
                    balanceMap.set(splitUserId, { name: splitUserName, amount: 0 });
                }
                balanceMap.get(splitUserId)!.amount += split.share;
            } else if (splitUserId === userId && payerId !== userId) {
                // They paid, I owe them
                if (!balanceMap.has(payerId)) {
                    balanceMap.set(payerId, { name: payerName, amount: 0 });
                }
                balanceMap.get(payerId)!.amount -= split.share;
            }
        }
    }

    // Process settlements
    for (const settlement of settlements) {
        const fromId = (settlement.fromUser as any)._id.toString();
        const toId = (settlement.toUser as any)._id.toString();
        const fromName = (settlement.fromUser as any).name;
        const toName = (settlement.toUser as any).name;

        if (fromId === userId) {
            // I paid someone (reduced what I owe them)
            if (!balanceMap.has(toId)) {
                balanceMap.set(toId, { name: toName, amount: 0 });
            }
            balanceMap.get(toId)!.amount += settlement.amount;
        } else if (toId === userId) {
            // Someone paid me (reduced what they owe me)
            if (!balanceMap.has(fromId)) {
                balanceMap.set(fromId, { name: fromName, amount: 0 });
            }
            balanceMap.get(fromId)!.amount -= settlement.amount;
        }
    }

    // Calculate totals
    let totalOwed = 0;
    let totalOwing = 0;
    const balances: UserBalance[] = [];

    for (const [otherUserId, data] of balanceMap) {
        // Skip zero balances
        if (Math.abs(data.amount) < 0.01) continue;

        if (data.amount > 0) {
            totalOwed += data.amount;
        } else {
            totalOwing += Math.abs(data.amount);
        }

        balances.push({
            userId: otherUserId,
            userName: data.name,
            amount: Math.round(data.amount * 100) / 100, // Round to 2 decimal places
        });
    }

    // Sort by absolute amount (largest first)
    balances.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    return {
        totalOwed: Math.round(totalOwed * 100) / 100,
        totalOwing: Math.round(totalOwing * 100) / 100,
        netBalance: Math.round((totalOwed - totalOwing) * 100) / 100,
        balances,
    };
}

/**
 * Get group balances for all members
 */
export async function getGroupBalances(
    groupId: string
): Promise<Map<string, BalanceSummary>> {
    const groupObjectId = new Types.ObjectId(groupId);

    // Get all expenses in the group
    const expenses = await Expense.find({ group: groupObjectId })
        .populate('paidBy', 'name')
        .populate('splits.user', 'name');

    // Get all settlements in the group
    const settlements = await Settlement.find({ group: groupObjectId })
        .populate('fromUser', 'name')
        .populate('toUser', 'name');

    // Build balance records for simplification
    const balanceRecords: Array<{
        fromUser: { _id: Types.ObjectId; name: string };
        toUser: { _id: Types.ObjectId; name: string };
        amount: number;
    }> = [];

    // Process expenses
    for (const expense of expenses) {
        const payer = expense.paidBy as any;

        for (const split of expense.splits) {
            const splitUser = split.user as any;

            if (!payer._id.equals(splitUser._id)) {
                balanceRecords.push({
                    fromUser: { _id: splitUser._id, name: splitUser.name },
                    toUser: { _id: payer._id, name: payer.name },
                    amount: split.share,
                });
            }
        }
    }

    // Process settlements (they reduce debts)
    for (const settlement of settlements) {
        balanceRecords.push({
            fromUser: { _id: (settlement.toUser as any)._id, name: (settlement.toUser as any).name },
            toUser: { _id: (settlement.fromUser as any)._id, name: (settlement.fromUser as any).name },
            amount: settlement.amount,
        });
    }

    // For now, return individual balances
    // The simplification happens in getSettlementSuggestions
    const memberBalances = new Map<string, BalanceSummary>();

    // Get unique members
    const memberIds = new Set<string>();
    for (const expense of expenses) {
        memberIds.add((expense.paidBy as any)._id.toString());
        for (const split of expense.splits) {
            memberIds.add((split.user as any)._id.toString());
        }
    }

    // Calculate balances for each member
    for (const memberId of memberIds) {
        memberBalances.set(memberId, await getUserBalances(memberId, groupId));
    }

    return memberBalances;
}

/**
 * Get optimized settlement suggestions for a group
 */
export async function getSettlementSuggestions(
    groupId: string
): Promise<OptimizedSettlement[]> {
    const groupObjectId = new Types.ObjectId(groupId);

    // Get all expenses in the group
    const expenses = await Expense.find({ group: groupObjectId })
        .populate('paidBy', 'name')
        .populate('splits.user', 'name');

    // Get all settlements in the group
    const settlements = await Settlement.find({ group: groupObjectId })
        .populate('fromUser', 'name')
        .populate('toUser', 'name');

    // Build balance records
    const balanceRecords: Array<{
        fromUser: { _id: Types.ObjectId; name: string };
        toUser: { _id: Types.ObjectId; name: string };
        amount: number;
    }> = [];

    // Process expenses
    for (const expense of expenses) {
        const payer = expense.paidBy as any;

        for (const split of expense.splits) {
            const splitUser = split.user as any;

            if (!payer._id.equals(splitUser._id)) {
                balanceRecords.push({
                    fromUser: { _id: splitUser._id, name: splitUser.name },
                    toUser: { _id: payer._id, name: payer.name },
                    amount: split.share,
                });
            }
        }
    }

    // Process settlements (they reduce debts)
    for (const settlement of settlements) {
        balanceRecords.push({
            fromUser: { _id: (settlement.toUser as any)._id, name: (settlement.toUser as any).name },
            toUser: { _id: (settlement.fromUser as any)._id, name: (settlement.fromUser as any).name },
            amount: settlement.amount,
        });
    }

    // Use simplification algorithm
    return getSimplifiedSettlements(balanceRecords);
}
