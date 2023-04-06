import messageModel from "../Models/MessageModel.js";

// add message using roomId ,senderId ,text
export const addMessage = async (req, res) => {
	const { roomId, senderId, text } = req.body;
	const message = new messageModel({
		roomId,
		senderId,
		text,
	});
	try {
		const result = await message.save();
		res.status(200).json(result);
	} catch (error) {
		res.status(500).json(error);
	}
};

// get message using chat/room id
export const getMessages = async (req, res) => {
	const { roomId } = req.params;
	try {
		const result = await messageModel.find({ roomId });
		res.status(200).json(result);
	} catch (error) {
		res.status(500).json(error);
	}
};
