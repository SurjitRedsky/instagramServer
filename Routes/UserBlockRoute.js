import express from "express";
import { blockUser, unBlockUser } from "../Controllers/UserBlockController.js";

const router =express.Router();


router.put ("/:userId/blocked",blockUser)
router.put("/:userId/unBlocked",unBlockUser)


export default router