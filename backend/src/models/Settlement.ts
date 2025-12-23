import mongoose, { Schema } from 'mongoose';
import { ISettlementDocument, SettlementStatus } from '../types';

const settlementSchema = new Schema<ISettlementDocument>(
    {
        fromUser: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Payer is required'],
        },
        toUser: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Receiver is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Settlement amount is required'],
            min: [1, 'Amount must be at least 1'],
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
        },
        note: {
            type: String,
            trim: true,
            maxlength: [200, 'Note cannot exceed 200 characters'],
        },
        status: {
            type: String,
            enum: Object.values(SettlementStatus),
            default: SettlementStatus.PENDING,
        },
        confirmedAt: {
            type: Date,
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

// Validate: fromUser and toUser must be different
settlementSchema.pre('save', function (next) {
    if (this.fromUser.equals(this.toUser)) {
        return next(new Error('Cannot settle with yourself'));
    }
    next();
});

// Create indexes
settlementSchema.index({ fromUser: 1, toUser: 1 });
settlementSchema.index({ group: 1 });
settlementSchema.index({ createdAt: -1 });

const Settlement = mongoose.model<ISettlementDocument>('Settlement', settlementSchema);

export default Settlement;
