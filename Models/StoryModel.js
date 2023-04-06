import mongoose,{Schema} from "mongoose";

const model=mongoose.Schema({
  
    media: {
			type: Array,
			required: true,
		}, 
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
},
{
  timestamps: true,
}
)
const storyModel=mongoose.model("story",model)
export default storyModel;
