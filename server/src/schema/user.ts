import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    hashedPassword: string;
    inventory: { itemId: ObjectId; quantity: number; }[];
    balance: number;
}

export interface IUserDocument extends IUser, Document { }

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    inventory: { type: [{ itemId: Schema.Types.ObjectId, quantity: Number }], default: [] },
    balance: { type: Number, default: 0 },
});

export const UserModel = mongoose.model<IUserDocument>("User", UserSchema);