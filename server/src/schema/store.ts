import { ref } from "joi";
import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IStore {
    itemId: mongoose.Types.ObjectId;
    quantity: number;
    pricePerItem: number;
    ownerId: mongoose.Types.ObjectId;
}

export interface IStoreDocument extends Document, IStore {
    _id: mongoose.Types.ObjectId
}


const StoreSchema: Schema = new Schema({
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    quantity: { type: Number, required: true },
    pricePerItem: { type: Number, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const StoreModel = mongoose.model<IStoreDocument>("Store", StoreSchema);