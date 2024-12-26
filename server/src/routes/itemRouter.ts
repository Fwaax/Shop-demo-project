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
import { ObjectId } from "mongoose";
import { IInventory, IventoryModel } from "../schema/inventory";

const itemRouter: Router = express.Router();

itemRouter.get("/", async (req: Request, res: Response) => {
    try {
        const itemsStored = await ItemModel.find();
        if (itemsStored.length === 0) {
            return res.status(404).send({ message: "No items found" });
        }
        return res.status(200).send(itemsStored);
    } catch (error) {
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
        await IventoryModel.create(objectToAddToInventory);
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
        const userInventory = await IventoryModel.find({ userId: requestedUserId })
            .populate('itemId') // Populates the item details based on itemId reference
            .select('-userId -_id'); // Exclude the userId and _id fields from the result

        // Include item details and quantity in the response
        const items = userInventory.map((inventory) => ({
            item: inventory.itemId,
            quantity: inventory.quantity,
        }));

        console.log(`User items with quantities:`, items);

        return res.status(200).send(items);
    } catch (error) {
        console.log(`Error fetching items:`, error);
        res.status(500).send({ message: "Error fetching items.", error });
    }
});





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