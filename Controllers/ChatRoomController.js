import mongoose, { Schema } from "mongoose";
import chatRoomModel from "../Models/ChatRoomModel.js";
import messageModel from "../Models/MessageModel.js";
import UserModel from "../Models/UserModel.js";

// create room api controles
export const createRoom = async (req, res) => {
	const sender = mongoose.Types.ObjectId(req.body.senderId);
	const reciever = mongoose.Types.ObjectId(req.body.recieverId);
	console.log("senderID-->>", sender), console.log("rID-->>", reciever);

	const oldChat = await chatRoomModel.aggregate([
		{
			$match: { members: { $all: [sender, reciever] } },
		},
		{
			$lookup: {
				from: "users",
				foreignField: "_id",
				localField: "members",
				as: "members",
			},
		},
		{
			$project: { members: 1 },
		},
	]);

	// members: { $all: [sender, reciever] },
	// ]);
	const newChat = new chatRoomModel({
		members: [sender, reciever],
	});

	try {
		if (oldChat) {
			res.status(200).json(oldChat);
		} else {
			const result = await newChat.save();
			res.status(200).json(result);
		}
	} catch (error) {
		res.status(500).json(error);
	}
};

// export const createRoom = async (req, res) => {
// 	const oldChat = await chatRoomModel.findOne({
// 		members: {
// 			$all: {
// 				$elemMatch: {
// 					senderId: req.body.members[0],
// 					recieverId: req.body.members[1],
// 				},
// 			},
// 		},
// 	});
// 	const newChat = new chatRoomModel({
// 		members: [
// 			{ senderId: req.body.members[0], recieverId: req.body.members[1] },
// 		],
// 	});

// 	try {
// 		if (oldChat) {
// 			res.status(200).json(oldChat);
// 		} else {
// 			const result = await newChat.save();
// 			res.status(200).json(result);
// 		}
// 	} catch (error) {
// 		res.status(500).json(error);
// 	}
// };

// find userRoom by userId api controles
export const userRooms = async (req, res) => {
	const id = mongoose.Types.ObjectId(req.params.userId);

	const chat = await chatRoomModel.aggregate([
		{
			$match: { members: { $in: [id] } },
		},
		{
			$lookup: {
				from: "users",
				foreignField: "_id",
				localField: "members",
				as: "members",
			},
		},
		{
			$project: { members: 1 },
		},
	]);

	try {
		res.status(200).json(chat);
	} catch (error) {
		res.status(500).json(error);
	}
};

// find room common b/w two user
export const findRoom = async (req, res) => {
	const senderId = mongoose.Types.ObjectId(req.params.firstId);
	const recieverId = mongoose.Types.ObjectId(req.params.secondId);
	try {
		const chat = await chatModel.findOne({
			members: { $all: [senderId, recieverId] },
		});
		res.status(200).json(chat);
	} catch (error) {
		res.status(500).json(error);
	}
};

// export const findRoom = async (req, res) => {
// 	const senderId = req.params.firstId;
// 	const recieverId = req.params.secondId;
// 	try {
// 		const chat = await chatRoomModel.findOne({
// 			members: {
// 				$all: { $elemMatch: { senderId: senderId, recieverId: recieverId } },
// 			},
// 		});
// 		res.status(200).json(chat);
// 	} catch (error) {
// 		res.status(500).json(error);
// 	}
// };
// const chat = await chatModel.findOne({
// 	members: { $all: [req.params.firstId, req.params.secondId] },
// });
