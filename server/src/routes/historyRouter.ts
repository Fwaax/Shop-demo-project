import express, { Request, Response, Router } from "express";
import { TransferHistoryModel } from "../schema/transferHistory";

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


export default historyRouter;