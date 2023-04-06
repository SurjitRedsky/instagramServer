import mongoose, { Schema } from "mongoose";

const model = mongoose.Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "users",
		},
		follower: [
			{
				type: Schema.Types.ObjectId,
				ref: "users",
			},
		],
		following: [
			{
				type: Schema.Types.ObjectId,
				ref: "users",
			},
		],
	},
	{
		timestamps: true,
	}
);

const followModel = mongoose.model("follower", model);
export default followModel;
