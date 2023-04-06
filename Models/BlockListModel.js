import mongoose,{Schema} from "mongoose";
const model= mongoose.Schema(
  {
		userId: {
			type: Schema.Types.ObjectId,
			ref: "users",
		},
		blockedUsers: [{
			type: Schema.Types.ObjectId,
			ref: "users",
		}],
	},
	{
		timestamps: true,
	}
)


const blockUserModel=mongoose.model("blockList",model)
export default blockUserModel;
