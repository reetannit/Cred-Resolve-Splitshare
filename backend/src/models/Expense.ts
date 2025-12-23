import mongoose, { Schema } from 'mongoose';
import { IExpenseDocument, SplitType } from '../types';

const splitSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: [0, 'Amount cannot be negative'],
        },
        share: {
            type: Number,
            required: true,
            min: [0, 'Share cannot be negative'],
        },
    },
    { _id: false }
);

const expenseSchema = new Schema<IExpenseDocument>(
    {
        description: {
            type: String,
            required: [true, 'Expense description is required'],
            trim: true,
            maxlength: [200, 'Description cannot exceed 200 characters'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [1, 'Amount must be at least 1'],
        },
        paidBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Payer is required'],
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
        },
        splitType: {
            type: String,
            enum: Object.values(SplitType),
            required: [true, 'Split type is required'],
        },
        splits: {
            type: [splitSchema],
            validate: {
                validator: function (splits: any[]) {
                    return splits && splits.length > 0;
                },
                message: 'At least one split is required',
            },
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Validate splits sum up correctly
expenseSchema.pre('save', function (next) {
    const totalShares = this.splits.reduce((sum, split) => sum + split.share, 0);

    // Allow for small rounding differences (up to 1 unit)
    if (Math.abs(totalShares - this.amount) > 1) {
        const error = new Error(
            `Split shares (${totalShares}) must equal total amount (${this.amount})`
        );
        return next(error);
    }
    next();
});

// Create indexes for efficient queries
expenseSchema.index({ group: 1, createdAt: -1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ 'splits.user': 1 });
expenseSchema.index({ createdAt: -1 });

const Expense = mongoose.model<IExpenseDocument>('Expense', expenseSchema);

export default Expense;
