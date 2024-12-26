import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface Store {
    itemId: ObjectId;
    quantity: number;
    pricePerItem: number;
    ownerId: ObjectId;
}

export interface IStoreDocument extends Document { }

const StoreSchema: Schema = new Schema({
    itemId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true },
    pricePerItem: { type: Number, required: true },
    ownerId: { type: Schema.Types.ObjectId, required: true },
});

export const StoreModel = mongoose.model<IStoreDocument>("Store", StoreSchema);