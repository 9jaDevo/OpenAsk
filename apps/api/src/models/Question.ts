import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuestion extends Document {
    _id: Types.ObjectId;
    title: string;
    body: string;
    tags: string[];
    author: Types.ObjectId;
    authorSub: string;
    authorName?: string;
    voteCount: number;
    answerCount: number;
    aiDraftAnswer?: string;
    createdAt: Date;
    updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
    {
        title: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 160,
            trim: true,
        },
        body: {
            type: String,
            required: true,
            minlength: 20,
        },
        tags: {
            type: [String],
            required: true,
            validate: {
                validator: (tags: string[]) => tags.length >= 1 && tags.length <= 5,
                message: 'Questions must have between 1 and 5 tags',
            },
            index: true,
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
        answerCount: {
            type: Number,
            default: 0,
            index: true,
        },
        aiDraftAnswer: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Text index for search
questionSchema.index({ title: 'text', body: 'text' });

// Compound index for sorting
questionSchema.index({ createdAt: -1 });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
