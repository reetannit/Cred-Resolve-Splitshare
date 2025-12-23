/**
 * Split Calculator Utility
 * 
 * This is the core business logic for calculating expense splits.
 * It handles EQUAL, EXACT, and PERCENTAGE split types.
 */

import { SplitType, ISplit } from '../types';
import { Types } from 'mongoose';

export interface SplitInput {
    userId: string;
    amount?: number; // For EXACT: actual amount, For PERCENTAGE: percentage
}

export interface CalculatedSplit {
    user: Types.ObjectId;
    amount: number;
    share: number;
}

/**
 * Calculate shares based on split type
 */
export function calculateSplits(
    totalAmount: number,
    splitType: SplitType,
    splits: SplitInput[]
): CalculatedSplit[] {
    switch (splitType) {
        case SplitType.EQUAL:
            return calculateEqualSplit(totalAmount, splits);
        case SplitType.EXACT:
            return calculateExactSplit(totalAmount, splits);
        case SplitType.PERCENTAGE:
            return calculatePercentageSplit(totalAmount, splits);
        default:
            throw new Error(`Invalid split type: ${splitType}`);
    }
}

/**
 * Equal Split: Divide amount equally among all participants
 * Handles rounding by giving extra units to first participants
 */
function calculateEqualSplit(
    totalAmount: number,
    splits: SplitInput[]
): CalculatedSplit[] {
    const numParticipants = splits.length;
    if (numParticipants === 0) {
        throw new Error('At least one participant is required');
    }

    // Calculate base share (floor to handle rounding)
    const baseShare = Math.floor(totalAmount / numParticipants);
    // Calculate remainder to distribute
    const remainder = totalAmount - baseShare * numParticipants;

    return splits.map((split, index) => {
        // Give 1 extra unit to first 'remainder' participants
        const share = baseShare + (index < remainder ? 1 : 0);

        return {
            user: new Types.ObjectId(split.userId),
            amount: share, // For EQUAL, amount equals share
            share,
        };
    });
}

/**
 * Exact Split: Each participant pays a specific amount
 * Validates that amounts sum to total
 */
function calculateExactSplit(
    totalAmount: number,
    splits: SplitInput[]
): CalculatedSplit[] {
    if (splits.length === 0) {
        throw new Error('At least one participant is required');
    }

    // Check all splits have amounts
    for (const split of splits) {
        if (split.amount === undefined || split.amount < 0) {
            throw new Error('Each split must have a non-negative amount for EXACT split');
        }
    }

    // Validate sum equals total
    const sum = splits.reduce((acc, split) => acc + (split.amount || 0), 0);
    if (Math.abs(sum - totalAmount) > 1) {
        throw new Error(
            `Split amounts (${sum}) must equal total amount (${totalAmount})`
        );
    }

    return splits.map((split) => ({
        user: new Types.ObjectId(split.userId),
        amount: split.amount!,
        share: split.amount!,
    }));
}

/**
 * Percentage Split: Each participant pays a percentage of total
 * Validates percentages sum to 100
 * Handles rounding similar to equal split
 */
function calculatePercentageSplit(
    totalAmount: number,
    splits: SplitInput[]
): CalculatedSplit[] {
    if (splits.length === 0) {
        throw new Error('At least one participant is required');
    }

    // Check all splits have percentages
    for (const split of splits) {
        if (split.amount === undefined || split.amount < 0 || split.amount > 100) {
            throw new Error('Each split must have a percentage between 0 and 100');
        }
    }

    // Validate percentages sum to 100
    const totalPercentage = splits.reduce((acc, split) => acc + (split.amount || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error(
            `Percentages must sum to 100 (got ${totalPercentage})`
        );
    }

    // Calculate shares
    const calculatedSplits: CalculatedSplit[] = splits.map((split) => {
        const percentage = split.amount!;
        const share = Math.floor((totalAmount * percentage) / 100);

        return {
            user: new Types.ObjectId(split.userId),
            amount: percentage, // Store percentage as amount
            share,
        };
    });

    // Distribute rounding difference to first participant(s)
    const calculatedTotal = calculatedSplits.reduce((acc, s) => acc + s.share, 0);
    const diff = totalAmount - calculatedTotal;

    if (diff > 0 && calculatedSplits.length > 0) {
        // Add difference to first participant
        calculatedSplits[0].share += diff;
    }

    return calculatedSplits;
}

/**
 * Validate that the payer is included in the splits
 * (Not required, but often useful)
 */
export function validatePayerIncluded(
    payerId: string,
    splits: SplitInput[]
): boolean {
    return splits.some((split) => split.userId === payerId);
}

/**
 * Get summary of a split for display
 */
export function getSplitSummary(
    splitType: SplitType,
    splits: CalculatedSplit[]
): string {
    switch (splitType) {
        case SplitType.EQUAL:
            return `Split equally among ${splits.length} people`;
        case SplitType.EXACT:
            return `Split by exact amounts`;
        case SplitType.PERCENTAGE:
            return `Split by percentage`;
        default:
            return 'Custom split';
    }
}
