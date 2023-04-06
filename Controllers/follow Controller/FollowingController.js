import mongoose, { mongo, Schema } from "mongoose";
import followerModel from "../../Models/followModel/FollowModel.js";
// import followingModel from "../../Models/postModel/FollowingModel";

export const followUser = async (req, res) => {
	const { userId, id } = req.params;
	console.log("id :-->", id);
	console.log("userId :-->", req.body.to);
	const request = new followerModel({
		from: id,
		to: req.body.to,
	});

	try {
		await request.save();
		res.status(200).json(request);
	} catch (error) {
		res.status(500).json(error);
		console.log(error);
	}
};
