import mongoose from "mongoose";
import postModel from "../Models/PostModel.js";
import likeModel from "../Models/postModel/LikesModel.js";
import { constents } from "../Constents.js";

export const likePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.id;
  console.log("iiii->", userId, postId);

  try {
    const likeData = await likeModel.findOne({ postId: postId });

    if (likeData === null) {
      const newLike = new likeModel({ postId: postId, users: [userId] });
      await newLike.save();
      res.send(constents.RESPONES.UPDATE_SUCCESS("post was liked"));
    } else {
      if (likeData?.users?.includes(userId)) {
        await likeData.updateOne({ $pull: { users: userId } });
        res.send(constents.RESPONES.UPDATE_SUCCESS("post was disLiked"));
      } else {
        await likeData.updateOne({ $push: { users: userId } });
        res.send(constents.RESPONES.UPDATE_SUCCESS("post was liked"));
      }
    }
  } catch (error) {
    console.log(error);
    res.send(constents.RESPONES.ERROR(error));
  }
};

export const getLikes = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.postId);
  console.log("post uudd-->", id);
  let likeData = await likeModel.aggregate([
    {
      $match: { postId: id },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "users",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "postId",
        foreignField: "_id",
        as: "post",
      },
    },
  ]);
  console.log("data--->>", likeData);
  try {
    res.status(200).json(likeData);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const like = async (req, res) => {
  const likedData = new likeModel(req.body);
  try {
    await likedData.save();
    res.status(200).json(likedData);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
};
// organizationData.getUserByOrganizationName = async function (req, res) {
// 	const { name } = req.params;
// 	let organization = await organizations.aggregate([
// 		{
// 			$match: { organization_name: `${name}` },
// 		},
// 		{
// 			$lookup: {
// 				from: "users",
// 				localField: "_id",
// 				foreignField: "organizationsId",
// 				as: "OrganizationData",
// 			},
// 		},
// 	]);
// 	try {
// 		res.send(
// 			response.success(
// 				organization,
// 				response.messageForOrganizations.ORGANIZATION_STATUS
// 			)
// 		);
// 	} catch (err) {
// 		res.send(response.error(err));
// 	}
// };

// export const createPost = async (req, res) => {
// 	const newPost = new postModel(req.body);

// 	try {
// 		await newPost.save();
// 		res.status(200).json({ success: true, newPost });
// 	} catch (error) {
// 		res.status(500).json(error);
// 	}
// };
