import { Router } from "express";
import v0 from "./v0";

const api = Router();

api.use('/v0', v0)

export default api;