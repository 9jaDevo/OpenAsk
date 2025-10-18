import mongoose, { Schema, Document, Types } from 'mongoose';

export type VoteTargetType = 'question' | 'answer';
export type VoteValue = 1 | -1;

export interface IVote extends Document {
    targetType: VoteTargetType;
    targetId: Types.ObjectId;
    userId: string; // Auth0 sub
    value: VoteValue;
    createdAt: Date;
    updatedAt: Date;
}

const voteSchema = new Schema<IVote>(
    {
        targetType: {
            type: String,
            required: true,
            enum: ['question', 'answer'],
        },
        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        value: {
            type: Number,
            required: true,
            enum: [1, -1],
        },
    },
    {
        timestamps: true,
    }
);

// Unique compound index: one vote per user per target
voteSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>('Vote', voteSchema);
