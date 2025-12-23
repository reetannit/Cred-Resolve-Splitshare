import mongoose, { Schema } from 'mongoose';
import { IGroupDocument } from '../types';

const groupSchema = new Schema<IGroupDocument>(
    {
        name: {
            type: String,
            required: [true, 'Group name is required'],
            trim: true,
            minlength: [2, 'Group name must be at least 2 characters'],
            maxlength: [100, 'Group name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
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

// Ensure creator is always a member
groupSchema.pre('save', function (next) {
    if (!this.members.some((m) => m.equals(this.createdBy))) {
        this.members.push(this.createdBy);
    }
    next();
});

// Create indexes
groupSchema.index({ members: 1 });
groupSchema.index({ createdBy: 1 });

const Group = mongoose.model<IGroupDocument>('Group', groupSchema);

export default Group;
