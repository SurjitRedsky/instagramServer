import mongoose, { Schema, Types } from "mongoose";

const likesSchema = mongoose.Schema(
	{
		postId: {
			type: Schema.Types.ObjectId,
			ref: "post",
			required: true,
		},
		users: {
			type: [{ type: Schema.Types.ObjectId, ref: "users" }],
		},
	},
	{
		timestamps: true,
	}
);

const likeModel = mongoose.model("Likes", likesSchema);
export default likeModel;
