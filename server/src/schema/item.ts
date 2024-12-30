import mongoose, { Schema, Document, Types, ObjectId } from "mongoose";

export interface IItem {
    name: string;
    description: string;
    imageUrl: string;
}

export interface IItemDocument extends IItem, Document {
    _id: mongoose.Types.ObjectId; // Explicitly declare _id as ObjectId
}

const ItemSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        imageUrl: { type: String, required: true },
    },
    { id: false } // Disable the virtual `id` field if not needed
);

export const ItemModel = mongoose.model<IItemDocument>("Item", ItemSchema);
