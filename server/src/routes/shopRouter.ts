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
import { addQuantityToItemInventory as createOrIncreaseItemInventory } from "../logic";

const shopRouter: Router = express.Router();

// Get all my items from the database
shopRouter.get("/my-items", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;

        // Fetch all items in the shop with quantity > 0
        const storeData: IStore[] = await StoreModel.find({
            ownerId: requestedUserId,
            quantity: { $gt: 0 }, // Filter for quantity greater than 0
        })
            .populate("itemId")
            .lean();

        return res.status(200).send(storeData);
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
        const storeData: IStore[] = await StoreModel.find({
            ownerId: { $ne: requestedUserId },
            userId: { $ne: requestedUserId },
            quantity: { $gt: 0 }, // Filter for quantity greater than 0
        })
            .populate("itemId")
            .lean();
        console.log(storeData);
        return res.status(200).send(storeData);
    } catch (error) {
        console.error("Error fetching my items:", error);
        res.status(500).send({ message: "Error fetching items.", error });
    }
})

shopRouter.delete("/delete-item/:id", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;
        const id = req.params.id; // Extract the id from the URL
        console.log(`Here Delete route`);
        const storeItem = await StoreModel.findOne({ ownerId: requestedUserId, itemId: id }).lean();
        if (!storeItem) {
            return res.status(404).send({ message: "Item not found in user inventory" });
        }
        const quantityOfCalceledItem = storeItem.quantity;
        await StoreModel.deleteOne({ ownerId: requestedUserId, itemId: id });
        await createOrIncreaseItemInventory(requestedUserId, id, quantityOfCalceledItem);
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
        const storeItemDoc = await StoreModel.findOne({ _id: req.body.storeItemId });
        if (!storeItemDoc) {
            return res.status(404).send({ message: "Requested Item not found in Shop" });
        }

        // Get the seller's user ID from the store item document
        const sellerUserId = storeItemDoc.ownerId;

        // Check if the store has enough quantity of the item
        if (storeItemDoc.quantity < req.body.quantity) {
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
        const totalCost = storeItemDoc.pricePerItem * req.body.quantity;

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
        await createOrIncreaseItemInventory(requestedUserId, storeItemDoc.itemId.toString(), req.body.quantity);

        // Reduce the quantity of the item in the store
        storeItemDoc.quantity -= req.body.quantity;

        // If the item's quantity reaches zero, delete it from the store; otherwise, update it
        if (storeItemDoc.quantity === 0) {
            await StoreModel.deleteOne({ _id: storeItemDoc._id });
        } else {
            await storeItemDoc.save();
        }

        // Send success response
        return res.status(200).send({ message: "Item updated successfully" });
    } catch (error) {
        // Log the error and send a 500 response
        console.error("Error updating item:", error);
        res.status(500).send({ message: "Error updating item.", error });
    }
});


// shopRouter.post("/post-to-shop", userGuard, async (req: AuthorizedRequest, res: Response) => {
//     try {
//         const requestedUserId = req.jwtDecodedUser.id;
//         const selectedItemId = req.body.itemId;

//         const foundUser = await UserModel.findById(requestedUserId).select('-hashedPassword');
//         if (!foundUser) {
//             return res.status(404).send({ message: "User not found" });
//         }

//         const itemFromFrontend = await InventoryModel.findOne({ userId: requestedUserId, itemId: selectedItemId });
//         if (!itemFromFrontend) {
//             return res.status(404).send({ message: "Item not found in user inventory" });
//         }

//         const item = await ItemModel.findById(selectedItemId);
//         if (!item) {
//             return res.status(404).send({ message: "Item not found" });
//         }
//         const storeConverstion: Store = {
//             ownerId: foundUser._id,
//             itemId: item._id,
//             quantity: itemFromFrontend.quantity,
//             pricePerItem: 3,
//         }

//         // Further processing (e.g., adding the item to the shop)
//         res.status(200).send({ message: "Item posted to shop successfully" });
//     } catch (error) {
//         console.error("Error posting item to shop:", error);
//         res.status(500).send({ message: "Error posting item to shop.", error });
//     }
// });

export default shopRouter;