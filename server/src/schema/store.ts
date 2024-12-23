import mongoose, { Schema, Document } from "mongoose";

export interface Store {
    itemId: string;
    quantity: number;
    pricePerItem: number;
}

export interface IStoreDocument extends Document { }

const StoreSchema: Schema = new Schema({
    itemId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true },
    pricePerItem: { type: Number, required: true },
});

export const StoreModel = mongoose.model<IStoreDocument>("Store", StoreSchema);