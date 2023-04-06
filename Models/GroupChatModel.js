import mongoose, { Schema } from "mongoose";

const groupSchema = mongoose.Schema(
	{
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		groupMembers: {
			type: [{ type: Schema.Types.ObjectId, ref: "users" }],
			required: true,
		},
		groupName: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const groupChatModel = mongoose.model("groupChats", groupSchema);

export default groupChatModel;
