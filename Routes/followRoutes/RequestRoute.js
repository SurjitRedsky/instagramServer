import express from "express";
import { followUser } from "../../Controllers/follow Controller/FollowingController.js";
import {
	followNew,
	getFollowerByUserId,
	requestAccept,
	requestForFollow,
	unfollow,
} from "../../Controllers/follow Controller/FollowRequestCont.js";
const router = express.Router();

// router.post("/:id", requestForFollow);

router.put("/confirm/:id", requestAccept);
router.put("/unfollow/:id", unfollow);

router.post("/:id", followNew);
router.get("/getFollower/:id", getFollowerByUserId);

// router.get("/:postId", getLikes);
// router.put("/:id", likePost);
export default router;
