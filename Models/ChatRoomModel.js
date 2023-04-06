import mongoose, { Schema } from "mongoose";

const userSchema = mongoose.Schema(
	{
		members: {
			type: [{ type: Schema.Types.ObjectId, ref: "users", required: true }],
		},
	},
	{
		timestamps: true,
	}
);

const chatRoomModel = mongoose.model("chats", userSchema);

export default chatRoomModel;
