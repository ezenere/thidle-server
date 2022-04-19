import { Router } from "express";
import checkMail from "../../../../controllers/auth/checkMail";
import login from "../../../../controllers/auth/login";

const loginRouter = Router();

loginRouter.get('/check', checkMail).post('/login', login)

export default loginRouter;