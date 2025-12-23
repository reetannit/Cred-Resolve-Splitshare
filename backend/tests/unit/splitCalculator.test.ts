/**
 * Unit Tests for Split Calculator
 *
 * These tests demonstrate the correctness of split calculations.
 * Run with: npm test
 */

import { calculateSplits } from '../src/utils/splitCalculator';
import { SplitType } from '../src/types';

describe('Split Calculator', () => {
    describe('EQUAL Split', () => {
        it('should split amount equally among participants', () => {
            const result = calculateSplits(
                1000, // 1000 units
                SplitType.EQUAL,
                [
                    { userId: '507f1f77bcf86cd799439011' },
                    { userId: '507f1f77bcf86cd799439012' },
                ]
            );

            expect(result).toHaveLength(2);
            expect(result[0].share).toBe(500);
            expect(result[1].share).toBe(500);
        });

        it('should handle uneven division with remainder', () => {
            const result = calculateSplits(
                100, // 100 units among 3 people
                SplitType.EQUAL,
                [
                    { userId: '507f1f77bcf86cd799439011' },
                    { userId: '507f1f77bcf86cd799439012' },
                    { userId: '507f1f77bcf86cd799439013' },
                ]
            );

            expect(result).toHaveLength(3);
            // First person gets extra 1 due to rounding
            expect(result[0].share).toBe(34);
            expect(result[1].share).toBe(33);
            expect(result[2].share).toBe(33);
            // Total should equal original amount
            expect(result.reduce((sum, s) => sum + s.share, 0)).toBe(100);
        });

        it('should handle single participant', () => {
            const result = calculateSplits(
                500,
                SplitType.EQUAL,
                [{ userId: '507f1f77bcf86cd799439011' }]
            );

            expect(result).toHaveLength(1);
            expect(result[0].share).toBe(500);
        });

        it('should throw error for empty participants', () => {
            expect(() => {
                calculateSplits(100, SplitType.EQUAL, []);
            }).toThrow('At least one participant is required');
        });
    });

    describe('EXACT Split', () => {
        it('should use exact amounts specified', () => {
            const result = calculateSplits(
                1000,
                SplitType.EXACT,
                [
                    { userId: '507f1f77bcf86cd799439011', amount: 600 },
                    { userId: '507f1f77bcf86cd799439012', amount: 400 },
                ]
            );

            expect(result).toHaveLength(2);
            expect(result[0].share).toBe(600);
            expect(result[1].share).toBe(400);
        });

        it('should throw error if amounts do not sum to total', () => {
            expect(() => {
                calculateSplits(
                    1000,
                    SplitType.EXACT,
                    [
                        { userId: '507f1f77bcf86cd799439011', amount: 600 },
                        { userId: '507f1f77bcf86cd799439012', amount: 300 }, // Missing 100
                    ]
                );
            }).toThrow('Split amounts (900) must equal total amount (1000)');
        });

        it('should throw error if amount is missing', () => {
            expect(() => {
                calculateSplits(
                    1000,
                    SplitType.EXACT,
                    [
                        { userId: '507f1f77bcf86cd799439011', amount: 600 },
                        { userId: '507f1f77bcf86cd799439012' }, // Missing amount
                    ]
                );
            }).toThrow();
        });
    });

    describe('PERCENTAGE Split', () => {
        it('should calculate shares based on percentages', () => {
            const result = calculateSplits(
                1000,
                SplitType.PERCENTAGE,
                [
                    { userId: '507f1f77bcf86cd799439011', amount: 60 }, // 60%
                    { userId: '507f1f77bcf86cd799439012', amount: 40 }, // 40%
                ]
            );

            expect(result).toHaveLength(2);
            expect(result[0].share).toBe(600);
            expect(result[1].share).toBe(400);
        });

        it('should throw error if percentages do not sum to 100', () => {
            expect(() => {
                calculateSplits(
                    1000,
                    SplitType.PERCENTAGE,
                    [
                        { userId: '507f1f77bcf86cd799439011', amount: 60 },
                        { userId: '507f1f77bcf86cd799439012', amount: 30 }, // Only 90%
                    ]
                );
            }).toThrow('Percentages must sum to 100');
        });

        it('should handle decimal percentages', () => {
            const result = calculateSplits(
                1000,
                SplitType.PERCENTAGE,
                [
                    { userId: '507f1f77bcf86cd799439011', amount: 33.33 },
                    { userId: '507f1f77bcf86cd799439012', amount: 33.33 },
                    { userId: '507f1f77bcf86cd799439013', amount: 33.34 },
                ]
            );

            expect(result).toHaveLength(3);
            // Total should equal original amount (with rounding)
            const total = result.reduce((sum, s) => sum + s.share, 0);
            expect(total).toBe(1000);
        });
    });
});
