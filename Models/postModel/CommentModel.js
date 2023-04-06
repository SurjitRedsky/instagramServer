import mongoose, { Schema, Types } from "mongoose";
// import { stringify } from "uuid";

const commentSchema = mongoose.Schema(
	{
		postId: {
			type: Schema.Types.ObjectId,
			ref: "post",
			required: true,
		},
		commentedBy: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		text: {
			type: String,
		},
		likesOnComments: [
			{
				userId: { type: Schema.Types.ObjectId, ref: "users" },
				isLiked: { type: Boolean, default: false },
			},
		],
		replies: [
			{
				userId: {
					type: Schema.Types.ObjectId,
					ref: "users",
				},
				text: {
					type: String,
				},
				likesOnReplies: [{userId:{ type: Schema.Types.ObjectId, ref: "users" }}],
			},
		],
	},
	{
		timestamps: true,
	}
);

const CommentModel = mongoose.model("Comments", commentSchema);
export default CommentModel;
