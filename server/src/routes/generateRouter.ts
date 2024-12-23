import express, { Request, Response, Router } from "express";
import { UserModel } from "../schema/user";
import { userGuard } from "../guard/userGuard";
import { AuthorizedRequest } from "../interfaces";
import bcrypt from "bcrypt";
import { hashPassword } from "../utils/hasherPw";



const generateRouter: Router = express.Router();

generateRouter.post("/money", userGuard, async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;
        const userDoc = await UserModel.findById(requestedUserId);
        if (!userDoc) {
            return res.status(404).send({ message: "User not found" });
        }
        userDoc.balance += 1000;
        await userDoc.save();
        return res.status(200).send({ message: "Money generated successfully", user: userDoc });
    } catch (error) {
        res.status(500).send({ message: "Error generating money", error });
    }
});

export default generateRouter;