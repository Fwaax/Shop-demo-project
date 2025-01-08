import { UserModel } from "../schema/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../const/env";
import { DataContainedInToken } from "../interfaces";
import { InventoryModel } from "../schema/inventory";

export async function findUserByEmail(email: string) {
    const user = await UserModel.findOne({ email: email.toLocaleLowerCase() });
    if (!user) {
        return null;
    }
    return user;
}

export async function addUserToDataBase(user: any) {
    const foundUserByEmail = await findUserByEmail(user.email);
    if (foundUserByEmail) {
        throw new Error(`User with email ${user.email} already exists.`);
    }
    user.email - user.email.toLowerCase();
    await UserModel.create(user);
}

export async function findUserById(id: string) {
    const user = await UserModel.findById({ id: id });
    if (!user) {
        return null;
    }
    return user;
}

export async function getLoginToken(email: string, password: string) {
    const foundUserByEmail = await UserModel.findOne({ email }).select("+hashedPassword").exec();
    if (!foundUserByEmail) {
        throw new Error(`User not found.`);
    }
    const passwordMatch: boolean = await bcrypt.compare(password, foundUserByEmail.hashedPassword);
    if (!passwordMatch) {
        throw new Error(`Email or password is incorrect.`);
    }
    const objectTosign: DataContainedInToken = { id: foundUserByEmail._id.toString() };
    const token = jwt.sign({ id: foundUserByEmail._id }, JWT_SECRET, { expiresIn: "24h" });
    const userToReturn = {
        firstName: foundUserByEmail.firstName,
        email: foundUserByEmail.email,
    };
    return { token, user: userToReturn };
}

export async function addQuantityToItemInventory(params: { userId: string, itemId: string, quantity: number }) {
    await InventoryModel.findOneAndUpdate(
        { userId: params.userId, itemId: params.itemId }, // Filter criteria
        { $inc: { quantity: params.quantity } },  // Increment quantity if the document exists
        { upsert: true, new: true }        // Create a new document if it doesn't exist
    );
}
