import express from "express";
import {
	createRoom,
	findRoom,
	userRooms,
} from "../Controllers/ChatRoomController.js";

const router = express.Router();

router.post("/", createRoom);
router.get("/:userId", userRooms);
router.get("/find-room/:firstId/:secondId", findRoom);

export default router;
