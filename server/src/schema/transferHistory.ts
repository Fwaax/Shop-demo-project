import mongoose, { ObjectId, Schema } from "mongoose";

interface ITransferHistory {
    itemId: string;
    quantity: number;
    fromUserID: mongoose.Types.ObjectId;
    toUserID: mongoose.Types.ObjectId;
    totalCost: number;
    dateInUnix: number;
}

export interface ITransferHistoryDocument extends ITransferHistory, Document { }

export const TransferHistorySchema: Schema = new Schema({
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    quantity: { type: Number, required: true },
    fromUserID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUserID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    totalCost: { type: Number, required: true },
    // dateInUnix: { type: Number, required: true },
    dateInUnix: { type: Number, required: true, default: () => Math.floor(Date.now() / 1000) },
});

export const TransferHistoryModel = mongoose.model<ITransferHistoryDocument>("TransferHistory", TransferHistorySchema);