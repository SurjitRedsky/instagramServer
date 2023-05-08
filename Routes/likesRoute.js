import express from "express";
import { getLikes, like, likePost } from "../Controllers/PostLikeController.js";
const router = express.Router();

router.post("/", like);
router.get("/:postId", getLikes);
router.put("/:id" ,likePost);
export default router;
