import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		roomId: {
			type: Schema.Types.ObjectId,
			ref: "chats",
			requried: true,
		},
		senderId: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		text: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const messageModel = mongoose.model("message", messageSchema);
export default messageModel;
