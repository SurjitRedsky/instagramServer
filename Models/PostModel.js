import mongoose, { Schema } from "mongoose";
import { constents } from "../Constents.js";

const postSchema = mongoose.Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "users",
		},
		media: {
			type: Array,
			required: true,
		},
		content: {
			type: String,
		},
		tag: {
			type: [{ type: Schema.Types.ObjectId, ref: "users" }],
		},
		visibilty: {
			type: String,
			enum: ["public","private"],
			default: "public",
		},
		createdAt: {
			type: Date,
			default: new Date(),
		},
		expireAt:{
			type:Date,
			default:function (){
				const now = new Date();
				return now.setHours(now.getHours()+24)
			}
		},
		type:{
			type:String,
			enum:constents.MEDIA_TYPES,
			default:constents.MEDIA_TYPES.POST
		}
		
	},
	{
		timestamps: true,
	}
);



// story public = public 


const postModel = mongoose.model("post", postSchema);
export default postModel;
