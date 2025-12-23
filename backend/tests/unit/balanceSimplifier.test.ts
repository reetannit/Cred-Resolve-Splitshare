/**
 * Unit Tests for Balance Simplifier
 *
 * Tests the balance simplification algorithm that minimizes
 * the number of transactions needed to settle debts.
 */

import {
    calculateNetBalances,
    simplifySettlements,
    getSimplifiedSettlements,
} from '../src/utils/balanceSimplifier';
import { Types } from 'mongoose';

describe('Balance Simplifier', () => {
    const userA = new Types.ObjectId();
    const userB = new Types.ObjectId();
    const userC = new Types.ObjectId();

    describe('calculateNetBalances', () => {
        it('should calculate net balances correctly', () => {
            const balances = [
                {
                    fromUser: { _id: userA, name: 'Alice' },
                    toUser: { _id: userB, name: 'Bob' },
                    amount: 100,
                },
                {
                    fromUser: { _id: userB, name: 'Bob' },
                    toUser: { _id: userC, name: 'Charlie' },
                    amount: 50,
                },
            ];

            const netBalances = calculateNetBalances(balances);

            // Alice: -100 (owes Bob)
            // Bob: +100 - 50 = +50 (net owed)
            // Charlie: +50 (owed by Bob)
            expect(netBalances.get(userA.toString())?.balance).toBe(-100);
            expect(netBalances.get(userB.toString())?.balance).toBe(50);
            expect(netBalances.get(userC.toString())?.balance).toBe(50);
        });
    });

    describe('simplifySettlements', () => {
        it('should simplify to minimum transactions', () => {
            // Scenario:
            // A owes B $30
            // B owes C $20
            // C owes A $10
            // Net: A: -20, B: +10, C: +10
            // Simplified: A pays B $10, A pays C $10
            const netBalances = new Map([
                [userA.toString(), { userId: userA, userName: 'Alice', balance: -20 }],
                [userB.toString(), { userId: userB, userName: 'Bob', balance: 10 }],
                [userC.toString(), { userId: userC, userName: 'Charlie', balance: 10 }],
            ]);

            const settlements = simplifySettlements(netBalances);

            expect(settlements).toHaveLength(2);
            // Total amount settled should equal total debt
            const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0);
            expect(totalSettled).toBe(20);
        });

        it('should handle already balanced state', () => {
            const netBalances = new Map([
                [userA.toString(), { userId: userA, userName: 'Alice', balance: 0 }],
                [userB.toString(), { userId: userB, userName: 'Bob', balance: 0 }],
            ]);

            const settlements = simplifySettlements(netBalances);
            expect(settlements).toHaveLength(0);
        });
    });

    describe('getSimplifiedSettlements', () => {
        it('should process raw balance records and simplify', () => {
            const balances = [
                {
                    fromUser: { _id: userA, name: 'Alice' },
                    toUser: { _id: userB, name: 'Bob' },
                    amount: 100,
                },
                {
                    fromUser: { _id: userB, name: 'Bob' },
                    toUser: { _id: userA, name: 'Alice' },
                    amount: 60,
                },
            ];

            // Net: A owes B 40
            const settlements = getSimplifiedSettlements(balances);

            expect(settlements).toHaveLength(1);
            expect(settlements[0].from.userName).toBe('Alice');
            expect(settlements[0].to.userName).toBe('Bob');
            expect(settlements[0].amount).toBe(40);
        });
    });
});
