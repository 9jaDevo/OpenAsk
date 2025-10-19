import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    sub: string; // Auth0 subject ID
    email?: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        sub: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: false,
            unique: true,
            sparse: true, // Allow multiple null values
            index: true,
        },
        name: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model<IUser>('User', userSchema);
