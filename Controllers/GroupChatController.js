import groupChatModel from "../Models/GroupChatModel.js";

//create group for chat
export const createGroup = async (req, res) => {
	const newGroup = new groupChatModel({
		userId: req.body.userId,
		groupMembers: [req.body.member],
		name: `${req.body.name}`,
	});
	try {
		const result = await newGroup.save();
		res.status(200).json(result);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

// Add member and partcipents in group
//change- update
export const addGorupMember = async (req, res) => {
	const groupId = req.params.id;
	const { member } = req.body;

	const findGroup = await groupChatModel.findById(groupId);
	try {
		if (!findGroup.groupMembers.includes(member)) {
			await findGroup.updateOne({
				$push: { groupMembers: userId },
			});
			res.status(200).json("group update ");
		} else {
			res
				.status(404)
				.json({ sucess: false, message: "user already in this group" });
		}
	} catch (error) {
		res.status(500).json(error);
	}
};

// left  a group by user
//change- Update
export const leftGroup = async (req, res) => {
	const { id, userId } = req.params;
	const group = await groupChatModel.findById(id);
	try {
		if (group.groupMembers.includes(userId)) {
			await group.updateOne({ $pull: { groupMembers: userId } });
			res.status(200).json("User Left from This group");
		} else {
			res.status(403).json({
				success: false,
				message: "you are not a member of this group",
			});
		}
	} catch (error) {
		res.status(500).json(error);
	}
};

// get list of group in DB
export const getAllGroup = async (req, res) => {
	const groups = await groupChatModel.find();
	try {
		groups.length < 0
			? res.status(404).json("Group List was Empty")
			: res.status(200).json(groups);
	} catch (error) {
		res.status(500).json(error);
	}
};

//get group by groupId
export const getGroupById = async (req, res) => {
	const id = req.params.id;
	const group = await groupChatModel.findById(id);
	try {
		group
			? res.status(200).json(group)
			: res.status(404).json("No Group for this Id");
	} catch (error) {
		res.status(500).json(error);
	}
};

//get group By name
export const getGroupByName = async (req, res) => {
	const groupName = req.params.name;
	const group = await groupChatModel.find({ name: `${groupName}` });
	try {
		group
			? res.status(200).json(group)
			: res.status(404).json("no group with this name");
	} catch (error) {
		res.status(500).json(error);
	}
};

// get group by member of group
export const getGroupByUser = async (req, res) => {
	const userId = req.params.userId;
	const group = await groupChatModel.find({
		groupMembers: { $elemMatch: { $eq: `${userId}` } },
	});
	try {
		group
			? res.status(200).json(group)
			: res.status(404).json({
					success: false,
					message: "your are not a member of any group ",
			  });
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

// delete group from Db
export const deleteGroup = async (req, res) => {
	const id = req.params.id;
	const { userId } = req.body;

	try {
		const group = await groupChatModel.findById(id);
		if (group.groupMembers.includes(userId)) {
			await group.deleteOne();
			res.status(200).json("group deleted");
		} else {
			res.status(403).json("Action not perform");
		}
	} catch (error) {
		res.status(500).json(error);
	}
};
