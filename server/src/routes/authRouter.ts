import express, { Request, Response, Router } from "express";
import { UserModel } from "../schema/user";
import bcrypt from "bcrypt";
import { LoginValidationJoi } from "../validation/userValidationJoi";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../validation/userValidationJoi";
import { getLoginToken } from "../logic";


const authRouter: Router = express.Router();

authRouter.post("/by-email", async (req: Request, res: Response) => {
    try {
        const validationResult = LoginValidationJoi.validate(req.body, { allowUnknown: false });
        if (validationResult.error) {
            return res.status(400).send(validationResult.error.details[0].message);
        }
        const { email, password } = req.body;

        if (!EMAIL_REGEX.test(email)) {
            return res.status(403).send("email or password is incorrect");
        }
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(403).send("email or password is incorrect");
        }
        const loginTokenAndUser = await getLoginToken(email, password);
        res.json({ token: loginTokenAndUser.token, user: loginTokenAndUser.user });
    } catch (error) {
        res.status(500).send(error);
    }
});



export default authRouter;