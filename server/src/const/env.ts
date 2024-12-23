import dotenv from 'dotenv';
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const PORT = Number(process.env.PORT) || 3000;
export const JWT_SECRET = String(process.env.JWT_SECRET) || "d5826a13bc8397454b0656d10a388ff574fda623b3253c0ae71cd0937c206634";
export const DB_CONNECTION_URL = String(process.env.DB_CONNECTION_URL) || "";
export const DEFAULT_CONNECTION_URL = "mongodb://127.0.0.1:27017/gatoShop?retryWrites=true&w=majority";

export function printAllEnvVars() {
    console.log("All Environment Variables:");
    console.log("PORT:", PORT);
    console.log("JWT_SECRET:", JWT_SECRET);
    console.log("DB_CONNECTION_URL:", DB_CONNECTION_URL);
}
