import mongoose, { ObjectId, Schema } from "mongoose";

interface ITransferHistory {
    itemId: string;
    quantity: number;
    fromUserID: ObjectId;
    toUserID: ObjectId;
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
    dateInUnix: { type: Number, required: true },
});


export const TransferHistoryModel = mongoose.model<ITransferHistoryDocument>("TransferHistory", TransferHistorySchema);