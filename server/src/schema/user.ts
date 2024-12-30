import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    hashedPassword: string;
    balance: number;
}

export interface IUserDocument extends IUser, Document { _id: mongoose.Types.ObjectId }

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    balance: { type: Number, default: 0 },
});

export const UserModel = mongoose.model<IUserDocument>("User", UserSchema);