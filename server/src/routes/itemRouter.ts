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
import { IStore, StoreModel } from "../schema/store";
import { log } from "node:console";
import mongoose from "mongoose";
import { addQuantityToItemInventory } from "../logic";

const itemRouter: Router = express.Router();

itemRouter.get("/", async (req: Request, res: Response) => {
    try {
        const storeObjList = await StoreModel.find()
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

        if (storeObjList.length === 0) {
            return res.status(404).send({ message: "No items found" });
        }
        log(`itemsInStore`, storeObjList)
        return res.status(200).send(storeObjList);
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
        const userWithItem = await UserModel.findById(ownerIdAsObjectId).lean();
        if (!userWithItem) {
            return res.status(404).send({ message: "User not found" });
        }
        // Ensure itemId is valid
        if (!mongoose.Types.ObjectId.isValid(req.body.itemId)) {
            return res.status(400).send({ message: "Invalid item ID" });
        }
        const itemIdAsObjectId = new mongoose.Types.ObjectId(req.body.itemId);
        // Find the item
        const item = await ItemModel.findById(itemIdAsObjectId).lean();
        if (!item) {
            return res.status(404).send({ message: "Item not found" });
        }
        // Find the inventory item
        const inventoryObjDoc = await InventoryModel.findOne({
            userId: ownerIdAsObjectId,
            itemId: itemIdAsObjectId,
        });
        if (!inventoryObjDoc) {
            return res.status(404).send({ message: "Item not found in user inventory" });
        }
        if (inventoryObjDoc.quantity < req.body.quantity) {
            return res.status(400).send({ message: "Not enough items in inventory" });
        }
        // Decrease quanitity in inventory
        inventoryObjDoc.quantity -= req.body.quantity;
        await inventoryObjDoc.save();
        // Create store object
        const storeObjectReturnToStore: IStore = {
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
        await addQuantityToItemInventory({ userId: foundUser._id.toString(), itemId: newItemObjectId.toString(), quantity: itemQuantity });
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
        const userInventoryObjList = await InventoryModel.find({ userId: requestedUserId })
            .populate('itemId') // Populates the item details based on itemId reference
            .select('-userId -_id').lean(); // Exclude the userId and _id fields from the result

        // Include item details and quantity in the response
        const items = userInventoryObjList.map((inventory) => ({
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
        const inventoryObj = await InventoryModel.findOne({ userId: requestedUserId, itemId: req.params.id });
        if (!inventoryObj) {
            return res.status(404).send({ message: "Item not found in user inventory" });
        }
        return res.status(200).send(inventoryObj);
    } catch (error) {
        res.status(500).send({ message: "Error fetching item.", error });
    }
});

export default itemRouter;