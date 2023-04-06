import mongoose, { Schema } from "mongoose";
import { constents } from "../../Constents.js";

const requestSchema = mongoose.Schema(
	{
		from: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		to: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		isFollow: {
			type: Number,
			enum: Object.values(constents.REQUEST_STATUS),
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

const requestModel = mongoose.model("Request", requestSchema);
export default requestModel;
