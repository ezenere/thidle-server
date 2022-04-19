import express from "express";
import bodyParser from 'body-parser'
import api from "./api";

const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.use('/api', api)

export default router;