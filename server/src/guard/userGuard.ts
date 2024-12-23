import { JWT_SECRET } from "../const/env";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const userGuard = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Unauthorized,Provided no header" });
        }
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized,Provided no token" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        if (!decodedToken) {
            return res.status(401).json({ message: "Unauthorized,Provided token is invalid" });
        }
        console.log(`decodedToken`, decodedToken);
        req.jwtDecodedUser = decodedToken;
        next();
    } catch (error) {
        console.error(`Token verification error: ${error}`);
        console.log(`Personal Error for GuardError: ${error}`);
        return res.status(401).json({ message: "Unauthorized, Token verification failed" });
    }
};