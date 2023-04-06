import express from "express";
import {
	addGorupMember,
	createGroup,
	deleteGroup,
	getAllGroup,
	getGroupById,
	getGroupByName,
	getGroupByUser,
	leftGroup,
} from "../Controllers/GroupChatController.js";

const router = express.Router();

router.post("/", createGroup);
router.get("/", getAllGroup);
router.get("/:id", getGroupById);
router.get("/get-group-by-member/:userId", getGroupByUser);
router.get("/get-group-by-name/:name", getGroupByName);

router.put("/:id/addMember", addGorupMember);
router.put("/:id/leftGroup/:userId", leftGroup);

router.delete("/:id", deleteGroup);

export default router;
