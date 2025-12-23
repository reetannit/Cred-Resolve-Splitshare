/**
 * Balance Simplification Algorithm
 * 
 * This is an advanced feature that minimizes the number of transactions
 * needed to settle all debts. Uses a greedy approach.
 * 
 * Example:
 *   Before: A→B $10, B→C $5, C→A $3
 *   Net balances: A: +7, B: +5, C: -12
 *   After simplification: C→A $7, C→B $5 (only 2 transactions instead of 3)
 */

import { Types } from 'mongoose';

export interface NetBalance {
    userId: Types.ObjectId;
    userName: string;
    balance: number; // Positive = owed money, Negative = owes money
}

export interface OptimizedSettlement {
    from: {
        userId: Types.ObjectId;
        userName: string;
    };
    to: {
        userId: Types.ObjectId;
        userName: string;
    };
    amount: number;
}

/**
 * Calculate net balances from raw balance data
 */
export function calculateNetBalances(
    balances: Array<{
        fromUser: { _id: Types.ObjectId; name: string };
        toUser: { _id: Types.ObjectId; name: string };
        amount: number;
    }>
): Map<string, NetBalance> {
    const netBalances = new Map<string, NetBalance>();

    for (const balance of balances) {
        const fromId = balance.fromUser._id.toString();
        const toId = balance.toUser._id.toString();

        // Update 'from' user (they owe money, so negative)
        if (!netBalances.has(fromId)) {
            netBalances.set(fromId, {
                userId: balance.fromUser._id,
                userName: balance.fromUser.name,
                balance: 0,
            });
        }
        netBalances.get(fromId)!.balance -= balance.amount;

        // Update 'to' user (they are owed money, so positive)
        if (!netBalances.has(toId)) {
            netBalances.set(toId, {
                userId: balance.toUser._id,
                userName: balance.toUser.name,
                balance: 0,
            });
        }
        netBalances.get(toId)!.balance += balance.amount;
    }

    return netBalances;
}

/**
 * Simplify settlements using greedy algorithm
 * 
 * Algorithm:
 * 1. Find all creditors (positive balance) and debtors (negative balance)
 * 2. Match largest debtor with largest creditor
 * 3. Create settlement for min of their absolute values
 * 4. Update balances and repeat
 */
export function simplifySettlements(
    netBalances: Map<string, NetBalance>
): OptimizedSettlement[] {
    const settlements: OptimizedSettlement[] = [];

    // Create separate arrays for creditors and debtors
    const creditors: NetBalance[] = [];
    const debtors: NetBalance[] = [];

    for (const balance of netBalances.values()) {
        if (balance.balance > 0.01) {
            creditors.push({ ...balance });
        } else if (balance.balance < -0.01) {
            debtors.push({ ...balance });
        }
    }

    // Sort by absolute balance (descending)
    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance); // More negative first

    // Greedy matching
    let i = 0; // Creditor index
    let j = 0; // Debtor index

    while (i < creditors.length && j < debtors.length) {
        const creditor = creditors[i];
        const debtor = debtors[j];

        // Settlement amount is minimum of what creditor is owed and debtor owes
        const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

        if (amount > 0.01) {
            settlements.push({
                from: {
                    userId: debtor.userId,
                    userName: debtor.userName,
                },
                to: {
                    userId: creditor.userId,
                    userName: creditor.userName,
                },
                amount: Math.round(amount), // Round to avoid floating point issues
            });
        }

        // Update balances
        creditor.balance -= amount;
        debtor.balance += amount;

        // Move to next if balance is settled
        if (creditor.balance < 0.01) i++;
        if (debtor.balance > -0.01) j++;
    }

    return settlements;
}

/**
 * Full simplification from raw balance records
 */
export function getSimplifiedSettlements(
    balances: Array<{
        fromUser: { _id: Types.ObjectId; name: string };
        toUser: { _id: Types.ObjectId; name: string };
        amount: number;
    }>
): OptimizedSettlement[] {
    const netBalances = calculateNetBalances(balances);
    return simplifySettlements(netBalances);
}
