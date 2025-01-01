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

const shopRouter: Router = express.Router();

// Get all my items from the database
// shopRouter.get("/my-items", userGuard, async (req: AuthorizedRequest, res: Response) => {
//     try {
//         const requestedUserId = req.jwtDecodedUser.id;

//         // Fetch inventory for the user
//         const inventory = await InventoryModel.find({ userId: requestedUserId }).populate("itemId");

//         // Fetch price data from the store
//         const storeData: IStoreDocument[] = await StoreModel.find();

//         // Combine inventory with store price
//         const userItems = inventory.map((inv) => {
//             const storeItem = storeData.find((store) => store.itemId.toString() === inv.itemId.toString());
//             return {
//                 item: inv.itemId, // Populated item document
//                 quantity: inv.quantity,
//                 pricePerUnit: storeItem?.pricePerItem || 0, // Fetch price from store or default to 0
//                 userId: inv.userId,
//             };
//         });

//         return res.status(200).send(userItems);
//     } catch (error) {
//         console.error("Error fetching my items:", error);
//         res.status(500).send({ message: "Error fetching items.", error });
//     }
// });


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
shopRouter.get("/all-items", userGuard, async (req: Request, res: Response) => {
    try {
        const items = await ItemModel.find();
        if (items.length === 0) {
            return res.status(404).send({ message: "No items found" });
        }
        return res.status(200).send(items);
    } catch (error) {
        res.status(500).send({ message: "Error fetching items.", error });
    }
})


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