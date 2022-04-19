import { Router } from "express";
import jwt from "../../../../middlewares/jwt";
import loginRouter from "./login";
const auth = Router();

auth.use(jwt);

auth.use(loginRouter)

export default auth;