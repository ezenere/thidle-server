import { Router } from "express";
import auth from "./auth";
import load from "./load";
import profile from "./profile";
import user from "./user";

const v0 = Router();

v0.use('/user', user)
v0.use('/auth', auth)
v0.use('/profile', profile)
v0.use('/load', load)

export default v0;