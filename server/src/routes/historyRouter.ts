import express, { Request, Response, Router } from "express";
import { TransferHistoryModel } from "../schema/transferHistory";
import { userGuard } from "../guard/userGuard";
import { AuthorizedRequest } from "../interfaces";

const historyRouter: Router = express.Router();

historyRouter.get("/", async (req: Request, res: Response) => {
    try {
        const historyItems = await TransferHistoryModel.find()
            .populate("itemId", "name description imageUrl") // Populate item details
            .populate("fromUserID", "firstName lastName email") // Populate sender details
            .populate("toUserID", "firstName lastName email"); // Populate recipient details

        if (historyItems.length === 0) {
            return res.status(404).send({ message: "No items found" });
        }

        return res.status(200).send(historyItems);
    } catch (error) {
        res.status(500).send({ message: "Error fetching items.", error });
    }
});

historyRouter.get("/transaction-history", async (req: AuthorizedRequest, res: Response) => {
    try {
        const requestedUserId = req.jwtDecodedUser.id;
        const transactions = await TransferHistoryModel.find({ buyerId: requestedUserId })
            .populate('itemId') // Populate item details
            .sort({ dateInUnix: -1 }) // Sort by most recent
            .limit(5); // Optionally limit the results
        console.log("transactions History endpoint", transactions);

        res.status(200).send(transactions);
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        res.status(500).send({ message: "Error fetching transaction history.", error });
    }
});

export default historyRouter;