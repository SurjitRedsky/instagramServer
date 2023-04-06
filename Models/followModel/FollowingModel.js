import mongoose, { Schema } from "mongoose";

const model = mongoose.Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "users",
		},
		following: {
			type: Schema.Types.ObjectId,
			ref: "users",
		},
	},
	{
		timestamps: true,
	}
);

const followingModel = mongoose.model("following", model);
export default followingModel;
