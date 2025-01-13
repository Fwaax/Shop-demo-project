import express, { Request, Response, Router } from "express";
import { IItem, ItemModel } from "../schema/item";
import { userGuard } from "../guard/userGuard";
import { AuthorizedRequest } from "../interfaces";
import { ItemValidationJoi } from "../validation/itemValidationJoi";
import { UserModel } from "../schema/user";
import { IInventory, InventoryModel } from "../schema/inventory";
import { IStoreDocument, IStore, StoreModel } from "../schema/store";
import { log } from "node:console";
import mongoose from "mongoose";
import { createOrIncreaseItemInventory } from "../logic";
import { TransferHistoryModel } from "../schema/transferHistory";

const shopRouter: Router = express.Router();

// Get all my items from the database
shopRouter.get("/my-items", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;

        // Fetch all items in the shop with quantity > 0
        const storeObjList: IStore[] = await StoreModel.find({
            ownerId: requestedUserId,
            quantity: { $gt: 0 }, // Filter for quantity greater than 0
        })
            .populate("itemId")
            .lean();

        return res.status(200).send(storeObjList);
    } catch (error) {
        console.error("Error fetching my items:", error);
        res.status(500).send({ message: "Error fetching items.", error });
    }
});

// Get all others items from the database
shopRouter.get("/all-items", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;

        // Fetch all items in the shop with quantity > 0
        const storeObjList: IStore[] = await StoreModel.find({
            ownerId: { $ne: requestedUserId },
            userId: { $ne: requestedUserId },
            quantity: { $gt: 0 }, // Filter for quantity greater than 0
        })
            .populate("itemId")
            .lean();
        console.log(storeObjList);
        return res.status(200).send(storeObjList);
    } catch (error) {
        console.error("Error fetching my items:", error);
        res.status(500).send({ message: "Error fetching items.", error });
    }
})

shopRouter.delete("/delete-item", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;
        const storeObjId = req.body.storeObjId; // Extract the id from the URL
        console.log(`Here Delete route`);
        const storeObj = await StoreModel.findOne({ _id: storeObjId }).lean();
        if (!storeObj) {
            return res.status(404).send({ message: "Item not found in user inventory" });
        }
        if (storeObj.ownerId.toString() !== requestedUserId) {
            return res.status(403).send({ message: "You don't have permission to delete this item" });
        }
        const quantityOfCalceledItem = storeObj.quantity;
        await StoreModel.deleteOne({ _id: storeObjId });
        await createOrIncreaseItemInventory({ userId: requestedUserId, itemId: storeObj.itemId.toString(), quantity: quantityOfCalceledItem });
        return res.status(200).send({ message: "Item deleted successfully" });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).send({ message: "Error deleting item.", error });
    }
});

shopRouter.put("/buy-item", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        // Get the ID of the currently logged-in user from the decoded JWT
        const requestedUserId = req.jwtDecodedUser.id;

        // Find the store item being purchased by its ID
        const storeObjDoc = await StoreModel.findOne({ _id: req.body.storeObjId });
        if (!storeObjDoc) {
            return res.status(404).send({ message: "Requested Item not found in Shop" });
        }

        // Get the seller's user ID from the store item document
        const sellerUserId = storeObjDoc.ownerId;

        // Check if the store has enough quantity of the item
        if (storeObjDoc.quantity < req.body.quantity) {
            return res.status(400).send({ message: "Not enough items in shop" });
        }

        // Find the buyer (logged-in user) in the user database
        const buyerUserDoc = await UserModel.findOne({ _id: requestedUserId });
        if (!buyerUserDoc) {
            return res.status(404).send({ message: "Buyer User not found" });
        }

        // Find the seller in the user database
        const sellingUserDoc = await UserModel.findOne({ _id: sellerUserId });
        if (!sellingUserDoc) {
            return res.status(404).send({ message: "Selling User not found" });
        }

        // Calculate the total cost of the purchase
        const totalCost = storeObjDoc.pricePerItem * req.body.quantity;

        // Check if the buyer has enough balance to make the purchase
        if (buyerUserDoc.balance < totalCost) {
            return res.status(400).send({ message: "Buyer does not have enough balance" });
        }

        // Deduct the total cost from the buyer's balance
        buyerUserDoc.balance -= totalCost;

        // Add the total cost to the seller's balance
        sellingUserDoc.balance += totalCost;

        // Save the updated user balances
        await buyerUserDoc.save();
        await sellingUserDoc.save();

        // Add the purchased items to the buyer's inventory
        await createOrIncreaseItemInventory({ userId: requestedUserId, itemId: storeObjDoc.itemId.toString(), quantity: req.body.quantity });

        // Reduce the quantity of the item in the store
        storeObjDoc.quantity -= req.body.quantity;

        // If the item's quantity reaches zero, delete it from the store; otherwise, update it
        if (storeObjDoc.quantity === 0) {
            await StoreModel.deleteOne({ _id: storeObjDoc._id });
        } else {
            await storeObjDoc.save();
        }

        // await TransferHistoryModel.create({
        //     itemId: storeObjDoc.itemId.toString(),
        //     quantity: req.body.quantity,
        //     fromUserID: sellerUserId,
        //     toUserID: requestedUserId,
        //     totalCost: totalCost,
        //     dateInUnix: Math.floor(Date.now() / 1000),
        // });

        // Send success response
        return res.status(200).send({ message: "Item updated successfully" });
    } catch (error) {
        // Log the error and send a 500 response
        console.error("Error updating item:", error);
        res.status(500).send({ message: "Error updating item.", error });
    }
});

export default shopRouter;