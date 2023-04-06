import mongoose from "mongoose";

const OtpSchema = mongoose.Schema({
	otp: {
		type: String,
	},
	expirationTime: {
		type: Date,
	},
});

// import mongoose, { Schema, Types } from "mongoose";

// const likesSchema = mongoose.Schema(
// 	{
// 		postId: {
// 			type: Schema.Types.ObjectId,
// 			ref: "posts",
// 			required: true,
// 		},
// 		users: {
// 			type: [{ type: Schema.Types.ObjectId, ref: "users" }],
// 		},
// 	},
// 	{
// 		timestamps: true,
// 	}
// );

// const likeModel = mongoose.model("Likes", likesSchema);
// export default likeModel;
