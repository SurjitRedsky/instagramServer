import mongoose, { Schema } from "mongoose";
// import { stringify } from "uuid";

const replySchema = mongoose.Schema(
	{
		commentId: {
			type: Schema.Types.ObjectId,
			ref: "comments",
			required: true,
		},
		replyedBy: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		text: { type: String },
	},
	{
		timestamps: true,
	}
);

const ReplyModel = mongoose.model("Comments_Reply", replySchema);
export default ReplyModel;
