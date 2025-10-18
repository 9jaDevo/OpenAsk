import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnswer extends Document {
    _id: Types.ObjectId;
    question: Types.ObjectId;
    body: string;
    author: Types.ObjectId;
    authorSub: string;
    authorName?: string;
    voteCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
    {
        question: {
            type: Schema.Types.ObjectId,
            ref: 'Question',
            required: true,
            index: true,
        },
        body: {
            type: String,
            required: true,
            minlength: 20,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        authorSub: {
            type: String,
            required: true,
            index: true,
        },
        authorName: {
            type: String,
        },
        voteCount: {
            type: Number,
            default: 0,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for sorting answers by votes
answerSchema.index({ question: 1, voteCount: -1 });

export const Answer = mongoose.model<IAnswer>('Answer', answerSchema);
