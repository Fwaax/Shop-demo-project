// Get all items from the database
// Get 1 Item from the database
// Add an item to the database
// Delete an item from the database
// Update an item in the database

import express, { Request, Response, Router } from "express";
import { IItem, ItemModel } from "../schema/item";
import { userGuard } from "../guard/userGuard";
import { AuthorizedRequest } from "../interfaces";
import { ItemValidationJoi } from "../validation/itemValidationJoi";
import { UserModel } from "../schema/user";
import { IInventory, InventoryModel } from "../schema/inventory";
import { Store, StoreModel } from "../schema/store";
import { log } from "node:console";
import mongoose from "mongoose";

const itemRouter: Router = express.Router();

itemRouter.get("/", async (req: Request, res: Response) => {
    try {
        const itemsInStore = await StoreModel.find()
            .populate({
                path: "itemId",
                model: "Item", // Populate with data from the "Item" model
                select: "name description imageUrl", // Select only necessary fields
            })
            .populate({
                path: "ownerId",
                model: "User", // Replace "User" with the correct model name for your user schema
                select: "nickname email", // Select only necessary fields
            });

        if (itemsInStore.length === 0) {
            return res.status(404).send({ message: "No items found" });
        }
        log(`itemsInStore`, itemsInStore)
        return res.status(200).send(itemsInStore);
    } catch (error) {
        console.error("Error fetching items in store:", error);
        res.status(500).send({ message: "Error fetching items.", error });
    }
});


itemRouter.get("/item/:id", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;
        const userWithItem = await UserModel.findById(requestedUserId);
        if (!userWithItem) {
            return res.status(404).send({ message: "User not found" });
        }

        const item = await ItemModel.findById(requestedUserId);
        if (!item) {
            return res.status(404).send({ message: "Item not found" });
        }
        return res.status(200).send(item);
    } catch (error) {
        res.status(500).send({ message: "Error fetching item.", error });
    }
});

itemRouter.post("/item", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;

        // Ensure requestedUserId is valid
        if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {
            return res.status(400).send({ message: "Invalid user ID" });
        }
        const ownerIdAsObjectId = new mongoose.Types.ObjectId(requestedUserId);

        // Check if the user exists
        const userWithItem = await UserModel.findById(ownerIdAsObjectId);
        if (!userWithItem) {
            return res.status(404).send({ message: "User not found" });
        }

        // Ensure itemId is valid
        if (!mongoose.Types.ObjectId.isValid(req.body.itemId)) {
            return res.status(400).send({ message: "Invalid item ID" });
        }
        const itemIdAsObjectId = new mongoose.Types.ObjectId(req.body.itemId);

        // Find the item
        const item = await ItemModel.findById(itemIdAsObjectId);
        if (!item) {
            return res.status(404).send({ message: "Item not found" });
        }

        // Find the inventory item
        const inventoryItem = await InventoryModel.findOne({
            userId: ownerIdAsObjectId,
            itemId: itemIdAsObjectId,
        });
        if (!inventoryItem) {
            return res.status(404).send({ message: "Item not found in user inventory" });
        }

        // Create store object
        const storeObjectReturnToStore: Store = {
            ownerId: ownerIdAsObjectId,
            itemId: itemIdAsObjectId,
            quantity: req.body.quantity,
            pricePerItem: req.body.price,
        };

        // Save the store item to the database
        const storeItem = await StoreModel.create(storeObjectReturnToStore);

        return res.status(200).send(storeItem);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error processing request.", error });
    }
});


itemRouter.post("/new-item", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;
        const validationResult = ItemValidationJoi.validate(req.body);
        if (validationResult.error) {
            console.log(`validationResult.error`, validationResult.error);
            return res.status(400).send(validationResult.error.details[0].message);
        }
        const foundUser = await UserModel.findById(requestedUserId);
        if (!foundUser) {
            return res.status(404).send({ message: "User not found" });
        }
        const itemFromFrontend = req.body;
        // Convert item data to the expected type
        const convertedItem: IItem = {
            name: itemFromFrontend.itemName,
            description: itemFromFrontend.itemDescription,
            imageUrl: itemFromFrontend.itemImage,
        };
        const newItem = await ItemModel.create(convertedItem);
        const newItemObjectId = newItem._id; // Explicitly use ObjectId
        // Convert itemQuantity to a number
        const itemQuantity = parseInt(req.body.itemQuantity, 10);
        if (isNaN(itemQuantity) || itemQuantity <= 0) {
            return res.status(400).send({ message: "Invalid item quantity" });
        }
        // Add the item to the user's inventory
        const objectToAddToInventory: IInventory = { userId: foundUser._id, itemId: newItemObjectId, quantity: itemQuantity };
        // add item to inventoryschema
        await InventoryModel.create(objectToAddToInventory);
        console.log(`newItem`, newItem);
        return res.status(200).send({ message: "Item added successfully", item: newItem });
    } catch (error) {
        console.log(`catchError`, error);
        res.status(500).send({ message: "Error adding item.", error });
    }
});



itemRouter.get("/my-items", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;

        // Find inventory items for the user and populate item details
        const userInventory = await InventoryModel.find({ userId: requestedUserId })
            .populate('itemId') // Populates the item details based on itemId reference
            .select('-userId -_id'); // Exclude the userId and _id fields from the result

        // Include item details and quantity in the response
        const items = userInventory.map((inventory) => ({
            item: inventory.itemId,
            quantity: inventory.quantity,
        }));
        return res.status(200).send(items);
    } catch (error) {
        console.log(`Error fetching items:`, error);
        res.status(500).send({ message: "Error fetching items.", error });
    }
});

itemRouter.get("/my-items/:id", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;
        const inventoryItem = await InventoryModel.findOne({ userId: requestedUserId, itemId: req.params.id });
        if (!inventoryItem) {
            return res.status(404).send({ message: "Item not found in user inventory" });
        }
        return res.status(200).send(inventoryItem);
    } catch (error) {
        res.status(500).send({ message: "Error fetching item.", error });
    }
});





// itemRouter.post("/post-to-shop", userGuard, async (req: AuthorizedRequest, res: Response) => {
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




// itemRouter.post("/post-to-shop", userGuard, async (req: AuthorizedRequest, res: Response) => {
//     try {
//         const requestedUserId = req.jwtDecodedUser.id;
//         const foundUser = await UserModel.findById(requestedUserId);
//         if (!foundUser) {
//             return res.status(404).send({ message: "User not found" });
//         }

//         const itemFromFrontend = req.body;
//         // Convert item data to the expected type
//         const convertedItem: IItem = {
//             name: itemFromFrontend.itemName,
//             description: itemFromFrontend.itemDescription,
//             imageUrl: itemFromFrontend.itemImage,
//         };
//         const newItem = await ItemModel.create(convertedItem);
//         const newItemObjectId = newItem._id; // Explicitly use ObjectId
//         // Convert itemQuantity to a number
//         const itemQuantity = parseInt(req.body.itemQuantity, 10);
//         if (isNaN(itemQuantity) || itemQuantity <= 0) {
//             return res.status(400).send({ message: "Invalid item quantity" });
//         }
//         // Add the item to the user's inventory
//         const objectToAddToInventory = { itemId: newItemObjectId, quantity: itemQuantity };
//         await foundUser.save();
//         console.log(`newItem`, newItem);
//         return res.status(200).send({ message: "Item added successfully", item: newItem });
//     } catch (error) {
//         console.log(`catchError`, error);
//         res.status(500).send({ message: "Error adding item.", error });
//     }
// });


export default itemRouter;