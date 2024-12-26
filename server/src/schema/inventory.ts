import mongoose, { Schema, Document, Types, ObjectId } from "mongoose";

export interface IInventory {
    userId: ObjectId;
    itemId: ObjectId;
    quantity: number;
}

export interface IIventoryDocument extends IInventory, Document {
    _id: ObjectId;
}

const ItemSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
        quantity: { type: Number, required: true },
    }
);

export const IventoryModel = mongoose.model<IIventoryDocument>("Inventory", ItemSchema);
