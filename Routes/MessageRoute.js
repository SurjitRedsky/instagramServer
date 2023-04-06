import express from "express";
import { addMessage, getMessages } from "../Controllers/MessageController.js";

const router = express.Router();

router.post("/", addMessage);
router.get("/:roomId", getMessages);

export default router;
