import express, { Request, Response, Router } from "express";
import { UserModel } from "../schema/user";
import { userGuard } from "../guard/userGuard";
import { AuthorizedRequest } from "../interfaces";
import bcrypt from "bcrypt";
import { hashPassword } from "../utils/hasherPw";
import { ItemModel } from "../schema/item";



const userRouter: Router = express.Router();

userRouter.get("/", userGuard, async (req: Request, res: Response) => {
    try {
        const users = await UserModel.find();
        if (users.length === 0) {
            return res.status(404).send({ message: "No users found" });
        }
        return res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ message: "Error fetching users.", error });
    }
});

userRouter.get("/:id", userGuard, async (req: Request, res: Response) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        return res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: "Error fetching user.", error });
    }
});

userRouter.delete("/:id", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;
        const user = await UserModel.findByIdAndDelete(requestedUserId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        return res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting user.", error });
    }
});

userRouter.put("/update", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;
        const userDoc = await UserModel.findById(requestedUserId).select("+hashedPassword");
        if (!userDoc) {
            return res.status(404).send({ message: "User not found" });
        }
        const passwordMatch: boolean = await bcrypt.compare(req.body.currentPassword, userDoc.hashedPassword);
        if (!passwordMatch) {
            return res.status(401).send({ message: "Current password is incorrect" });
        }
        if (!req.body.newPassword || req.body.newPassword.length < 6) {
            return res.status(400).send({ message: "New password must be at least 6 characters long." });
        }
        const newHashedPassword = hashPassword(req.body.newPassword);
        userDoc.hashedPassword = newHashedPassword;
        const updatedUser = await userDoc.save();
        return res.status(200).send({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error); // Log error for debugging
        res.status(500).send({ message: "Error updating user.", error });
    }
});

userRouter.get("/:userId/items", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const { userId } = req.params;
        if (userId !== req.jwtDecodedUser.id) {
            return res.status(403).send({ message: "You are not authorized to view this user's items." });
        }
        const itemsStored = await ItemModel.find({ userId: userId });
        if (itemsStored.length === 0) {
            return res.status(404).send({ message: "No items found userRouter" });
        }
        return res.status(200).send(itemsStored);
    } catch (error) {
        res.status(500).send({ message: "Error fetching items.", error });
    }
})

export default userRouter;