import { constents } from "../Constents.js"
import storyModel from "../Models/StoryModel.js"
import  jwt  from "jsonwebtoken";

export const createStory=async (req,res)=>{

  //check authontication 
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWTKEY);
  const userId = decoded.id;

  const data = new storyModel(
    req.body
  )
  data.userId=userId
  


try {
  await data.save()
  res.send(constents.RESPONES.SUCCESS(data,"successFully created"))
} catch (error) {
  console.log(error);
  res.send(constents.RESPONES.ERROR(error))
}
}

