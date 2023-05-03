// import mongoose, { mongo, Schema } from "mongoose";
import requestModel from "../../Models/followModel/RequestModel.js";
import followModel from "../../Models/followModel/FollowModel.js";

import followerModel from "../../Models/followModel/FollowModel.js";
import followingModel from "../../Models/followModel/FollowingModel.js";
import UserModel from "../../Models/UserModel.js";
import mongoose from "mongoose";
import { constents } from "../../Constents.js";
import jwt from "jsonwebtoken";
// import followingModel from "../../Models/postModel/FollowingModel";

// export const getAllRequest = async (req, res) => {
// 	const user = req.user;
// 	const requests = await requestModel.find({});
// };

export const requestForFollow = async (req, res) => {
	const user = req.user;
	console.log("user-->", user);

	console.log("userId-->", user.id);
	const { id } = req.params;

	const request = new requestModel({
		from: user.id,
		to: id,
	});
	try {
		await request.save();
		res.send(constents.RESPONES.SUCCESS(request));
		// res.status(200).json(request);
	} catch (error) {
		res.send(constents.RESPONES.ERROR(error));
		// res.status(500).json(error);
		console.log(error);
	}
};

export const requestAccept = async (req, res) => {
	const requestId = req.params.id;
	try {
		const data = await requestModel.findById(requestId);
		// console.log("data--->>>", data);
		if (data) {
			const userId = data.from;
			const to = data.to;

			const following = await followModel.findOne({ userId: userId });
			// console.log("following--->>", following);
			if (following !== null) {
				await following.updateOne({ $push: { following: to } });
			} else {
				const followingData = new followModel({
					userId: userId,
					following: [mongoose.Types.ObjectId(to)],
					follower: [],
				});
				await followingData.save();
			}

			// check follower
			const follow = await followModel.findOne({ userId: to });
			if (follow !== null) {
				await follow.updateOne({ $push: { follower: userId } });
			} else {
				const followData = new followModel({
					userId: to,
					following: [],
					follower: [mongoose.Types.ObjectId(userId)],
				});
				await followData.save();
			}
		}
		await data.updateOne({ isFollow: 1 });

		res.status(200).json("following");
	} catch (error) {
		res.status(500).json(error);
		console.log(error);
	}
};

export const unfollow = async (req, res) => {


	const user = req.user;
	console.log("users-->>", user);

	const { id } = req.params;
	try {
		const unFollowUser = await followModel.find({ userId: user.id });
		const unFollowingUser = await followModel.findById(id);

		console.log("unfollow-->>", unFollowUser);
		if (unFollowUser.following.includes(id)) {
			await unFollowUser.updateOne({ $pull: { following: id } });
			await unFollowingUser.updateOne({ $pull: { follower: user.id } });
			res.send(constents.RESPONES.UPDATE_SUCCESS("Unfollowed Successfully!"));
		} else {
			res.send(
				constents.RESPONES.ACCESS_DENIED(
					(message = "You are not following this User")
				)
			);
		}
	} catch (error) {
		// res.status(500).json(error);
		res.send(constents.RESPONES.ERROR(error));
		console.log(error);
	}
};

export const followNew = async (req, res) => {

	const token = req.headers.authorization;
	console.log("token->",token);
	const decoded = jwt.verify(token, process.env.JWTKEY);
	const currentUserId = decoded.id;

	
  // const user = req.user
	const { id } = req.params;

	try {
		const followedUser = await UserModel.findById(id);
		console.log("followedUser==>", followedUser);

		if (followedUser.visibility === 1) {
			const following = await followModel.findOne({ userId: currentUserId });
			console.log("following->", following);

			// if (following.following.includes(id)) {
			// res.send("ALREADY FOLLOWING");
			// } else
			if (following !== null) {
				await following.updateOne({ $push: { following: id } });
			} else {
				const followingData = new followModel({
					userId: currentUserId ,
					following: [mongoose.Types.ObjectId(id)],
					follower: [],
				});
				await followingData.save();

				// check follower
				const follow = await followModel.findOne({ userId: id });
				console.log("follow->", follow);
				if (follow !== null) {
					await follow.updateOne({ $push: { follower: currentUserId } });
				} else {
					const followData = new followModel({
						userId: id,
						following: [],
						follower: [mongoose.Types.ObjectId(currentUserId )],
					});
					await followData.save();
				}
			}
			res.send(constents.RESPONES.SUCCESS("","following"))
			// res.status(200).json("following");
		} else {
			const request = new requestModel({
				from: currentUserId ,
				to: id,
			});
			await request.save();
			res.send(constents.RESPONES.SUCCESS(request,"requested"));
		}
	} catch (error) {
		console.log(error);
	}
};

export const getFollowerByUserId = async (req, res) => {
	const userId = req.params.id;
	console.log("userId==>", userId);

	try {
		const data = await followModel.aggregate([
			{
				$match: { userId: mongoose.Types.ObjectId(userId) },
			},
			{
				$lookup: {
					from: "users",
					localField: "follower",
					foreignField: "_id",
					as: "follwers",
				},
			},
		]);
		console.log("data from getFollowerByUserId==>", data);
		res.send(data);
	} catch (error) {
		console.log(error);
	}
};

// export const requestForFollow = async (req, res) => {
// 	const { id, userId } = req.params;
// 	const request = new requestModel({
// 		from: id,
// 		to: userId,
// 	});
// 	const user = await UserModel.findById(userId);
// 	console.log("user--->>", user);

// 	const following = new followingModel({
// 		userId: id,
// 		following: userId,
// 	});

// 	try {
// 		await request.save();
// 		await following.save();
// 		res.status(200).json(request);
// 	} catch (error) {
// 		res.status(500).json(error);
// 		console.log(error);
// 	}
// };

// export const requestAccept = async (req, res) => {
// 	const requestId = req.params.id;
// 	try {
// 		const data = await requestModel.findByIdAndUpdate(requestId, {
// 			isFollow: 1,
// 		});
// 		if (data) {
// 			const follower = new followerModel({
// 				userId: data.from,
// 				follower: data.to,
// 			});
// 			await follower.save();
// 		}
// 		await requestModel.findOneAndDelete(requestId);
// 		// const following=new followingModel({
// 		// 	userId:
// 		// 	following:
// 		// })
// 		res.status(200).json("following");
// 	} catch (error) {
// 		res.status(500).json(error);
// 	}
// };

// export const requestAccept = async (req, res) => {
// 	const requestId = req.params.id;
// 	console.log(requestId);
// 	try {
// 		await followerModel.findByIdAndUpdate(requestId, { isFollow: "follow" });
// 		res.status(200).json("following");
// 	} catch (error) {
// 		res.status(500).json(error);
// 	}
// };
