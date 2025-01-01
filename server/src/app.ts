import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import colorfulMorganFormat from "./utils/morgan";
import { DB_CONNECTION_URL, DEFAULT_CONNECTION_URL, PORT } from "./const/env";
import registerRouter from "./routes/registerRouter";
import authRouter from "./routes/authRouter"
import userRouter from "./routes/userRouter";
import generateRouter from "./routes/generateRouter";
import itemRouter from "./routes/itemRouter";
import historyRouter from "./routes/historyRouter";
import shopRouter from "./routes/shopRouter";

export async function startExpressServer() {
    // Create Express app
    const app: Express = express();

    // Connect to db
    if (!DB_CONNECTION_URL) {
        console.error(`\x1b[31mDB_CONNECTION_URL is not defined, go to .env file and define it.
        You can try using ${DEFAULT_CONNECTION_URL}.\x1b[0m`);
        return;
    }
    await mongoose.connect(DB_CONNECTION_URL, {});

    // Middleware to parse JSON bodies
    app.use(express.json());

    // Enable CORS for all routes
    app.use(cors());

    // Log all requests and responses
    app.use(morgan(colorfulMorganFormat));

    app.use("/user", userRouter);
    app.use("/login", authRouter);
    app.use("/", registerRouter);
    app.use("/generate", generateRouter);
    app.use("/item", itemRouter);
    app.use("/history", historyRouter)
    app.use("/shop", shopRouter)

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}
