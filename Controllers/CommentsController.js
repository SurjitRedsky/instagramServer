import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import CommentModel from "../Models/postModel/CommentModel.js";
import { constents } from "../Constents.js";
import ReplyModel from "../Models/postModel/ReplyModel.js";
// import { constants } from "fs/promises";
const secret = "fe1a1925a379f3be5394b64d14794933";

// 1.  -----  createComment ------
// POST API---->>>  http://localhost:4000/comment/:POSTID
// BODY---->>   {"text":""}

// 2. ----- Reply on comment -------
// PUTT API ---->>>> http://localhost:4000/comment/:${postId}/reply
// BODY ----->> {"text":""}

//3. ------ get Comments -------
// GET API ---->>>  http://localhost:4000/comment/:postId

//4. -----  comments likes and disilke ------
//PUT API ----->>>> http://localhost:4000/comment/:commentId/like

//finaly
export const createComment = async (req, res) => {
	try {
		const token = req.headers.authorization;
		console.log("token from craete comments->", token);
		const decoded = jwt.verify(token, secret);
		const userId = decoded.id;

		const { text } = req.body;
		const postId = req.params.postId;
		const comment = new CommentModel({
			postId: postId,
			commentedBy: userId,
			text: text,
		});

		if (comment !== null) {
			await comment.save();
			res.send(constents.RESPONES.SUCCESS({comment}));
		} else {
			res.send(constents.RESPONES.UPDATE_SUCCESS("No Comment Created"));
		}
	} catch (error) {
		console.log(error);
		res.send(constents.RESPONES.ERROR(error));
	}
};

//finallyyy==========>.........
export const replyComments2 = async (req, res) => {
	const { commentId } = req.params;
	try {
		const { text } = req.body;

		const token = req.headers.authorization;
		const decoded = jwt.verify(token, secret);
		const userId = decoded.id;

		console.log("userId=>", userId);
		console.log("commentId=>", commentId);
		console.log("text=>", text);

		const data = { userId: userId, text: text };

		await CommentModel.findByIdAndUpdate(commentId, {
			$push: { replies: data },
		});

		res.send(constents.RESPONES.UPDATE_SUCCESS("replies"));
	} catch (error) {
		console.log(error);
		res.send(constents.RESPONES.ERROR(error));
	}
};

//finallyyyy
export const getCommentWithReply = async (req, res) => {
	const { postId } = req.params;
	console.log("postid=>", postId);
	try {
		const data = await CommentModel.aggregate([
			{
				$match: { postId: mongoose.Types.ObjectId(postId) },
			},
			{
				$lookup: {
					from: "users",
					foreignField: "_id",
					localField: "commentedBy",
					as: "user",
				},
			},
			{
				$unwind: {
					path: "$user",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: "users",
					foreignField: "_id",
					localField: "replies.userId",
					as: "repliedUser",
				},
			},
			{
				$unwind: {
					path: "$repliedUser",
					preserveNullAndEmptyArrays: true,
				},
			},

			{
				$project: {
					text: 1,
					user: {
						userName: "$user.userName",
						profileImage: "$user.profileImage.thumbnail",
					},
					likesOnComments: 1,
					replies: 1,
					replies: {
						text: 1,
						repliedUser: {
							userName: "$repliedUser.userName",
							profileImage: "$repliedUser.profileImage.thumbnail",
						},
						likesOnReplies: 1,
						_id: 1,
					},
					createdAt: 1,
				},
			},
		]);
		console.log("data=>", data);
		res.send(constents.RESPONES.SUCCESS(data));
	} catch (error) {
		console.log(error);
		res.send(constents.RESPONES.ERROR(error));
	}
};

//likes on comments

export const likeOnComments = async (req, res) => {
	const { commentId } = req.params;
	console.log("commentId=>", commentId);
	const token = req.headers.authorization;
	const decoded =ßjwt.verify(token, secret);
	const userId = decoded.id;
	console.log("userId=>", userId);
	try {
		const commentLikes = await CommentModel.findById(commentId);

		const result = commentLikes.likesOnComments.filter((item) => {
			// item.userId !== mongoose.Types.ObjectId(userId);
			return item.userId !== mongoose.Types.ObjectId(userId);
		});
		// console.log(
		// 	"likes=>",
		// 	commentLikes.likesOnComments.includes({
		// 		userId: mongoose.Types.ObjectId(userId),
		// 	})
		// );
		console.log("object", result);
		if (result.length === 0) {
			// await CommentModel.findByIdAndUpdate(commentId, {
			// 	$pull: { likesOnComments: userId },
			// });
			await commentLikes.updateOne({
				$push: { likesOnComments: { userId } },
				$set: { isLiked: true },
			});
			res.send(constents.RESPONES.UPDATE_SUCCESS("likeComments"));
		} else {
			await commentLikes.updateOne({
				$pull: { likesOnComments: { userId } },
				$set: { isLiked: false },
			});
			res.send(constents.RESPONES.UPDATE_SUCCESS("dislikeComments"));
		}
	} catch (error) {
		console.log(error);
		res.send(constents.RESPONES.ERROR(error));
	}
};

//likes on replies
export const likesOnReplies = async (req, res) => {
	const token = req.headers.authorization;
	const decoded = jwt.verify(token, secret);
	const userId = decoded.id;

	const { commentId } = req.params;
	const { id } = req.body;
	console.log("commentId=>", commentId);

	try {
		const newdata = await CommentModel.findOneAndUpdate({
			replies: { $elemMatch: { _id:commentId } },
		}
	)
	console.log("data->",newdata)

	

	//filter data 
	const filter =newdata.replies.filter((item)=>{
return item._id==commentId
})
console.log("filter=>",filter)


//find index of 
	function find(item){
		return item==filter[0]
	}
	const index = newdata.replies.findIndex(filter[0])
		console.log("index of -->",index)


		//edit value 
function addvalue(){
 filter[0].likesOnReplies.push({userId:userId})
	 return filter[0].likesOnReplies
		}
		var edit={
			userId: filter[0].userId,
                text: filter[0].text,
                likesOnReplies:addvalue(),
                _id: filter[0]._id
		}

console.log("edit->",edit);
filter[0]=edit
// newdata.replies.likesOnReplies.push

// await newdata.updateOne({$push: { likesOnReplies: edit }})


	res.send({ message:"success",data:newdata,filter:filter})
		
	} catch (error) {
		console.log(error);
	}
};

//////////////////////////////////////////////////////////////////
export const getCommentsOnPost = async (req, res) => {
	try {
		const { postId } = req.params;
		const data1 = await CommentModel.aggregate([
			{
				$match: { postId: mongoose.Types.ObjectId(postId) },
			},
			{
				$lookup: {
					from: "users",
					foreignField: "_id",
					localField: "commentedBy",
					as: "user",
				},
			},
			{
				$unwind: {
					path: "$user",
					preserveNullAndEmptyArrays: true,
				},
			},

			{
				$lookup: {
					from: "comments_replies",
					foreignField: "commentId",
					localField: "_id",
					as: "replies",
				},
			},
			{
				$unwind: {
					path: "$replies",
					preserveNullAndEmptyArrays: true,
				},
			},

			{
				$lookup: {
					from: "users",
					foreignField: "_id",
					localField: "replies.replyedBy",
					as: "replyedUser",
				},
			},

			{
				$unwind: {
					path: "$replyedUser",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					postId: 1,
					text: 1,
					user: {
						userName: "$user.userName",
						profileImage: "$user.profileImage.thumbnail",
					},
					createdAt: 1,
					replies: {
						text: "$replies.text",
						userName: "$replyedUser.userName",
						profileImage: "$replyedUser.profileImage.thumbnail",
					},
				},
			},
		]);

		// const data = await CommentModel.find({ postId: postId });
		console.log(data1.length);
		if (data1.length <= 0) {
			res.send(constents.RESPONES.NO_DATA());
		} else {
			console.log("data1->", data1);
			res.send(constents.RESPONES.SUCCESS(data1));
		}
	} catch (error) {
		console.log(error);
		res.send(constents.RESPONES.ERROR(error));
	}
};

export const deleteComment = async (req, res) => {
	const token = req.headers.authorization;
	const decoded = jwt.verify(token, secret);
	const userId = decoded.id;
	const { commentId } = req.params;

	try {
		const comment = await CommentModel.findById(commentId);

		if (comment.commentedBy === userId) {
			await comment.deleteOne();

			res.send(constents.RESPONES.UPDATE_SUCCESS("deleted succesfully"));
		} else {
			res.send(constents.RESPONES.ACCESS_DENIED());
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

// export const deletePost = async (req, res) => {
// 	const id = req.params.id;
// 	const { userId } = req.body;

// 	try {
// 		const post = await postModel.findById(id);
// 		const likeData = await likeModel.findOne({ postId: id });
// 		if (post.userId === userId) {
// 			await post.deleteOne();
// 			await likeData.deleteOne();
// 			res.send(constents.RESPONES.UPDATE_SUCCESS("post deleted succesfully"));
// 		} else {
// 			res.send(constents.RESPONES.ACCESS_DENIED());
// 			// res.status(403).json({ success: false, message: "Action forbidden" });
// 		}
// 	} catch (error) {
// 		res.status(500).json(error);
// 	}
// };
export const replyComment = async (req, res) => {
	const token = req.headers.authorization;
	const decoded = jwt.verify(token, secret);
	const userId = decoded.id;
	// const userId = mongoose.Types.ObjectId("63c4dffe8138dcd5fbeb84cc");
	console.log("userId->", userId);

	const { commentId } = req.params;
	const { text } = req.body;
	console.log("commentedId->", commentId);
	console.log("text->", text);
	try {
		const replyData = await ReplyModel.findOne({ replyedBy: userId });

		if (replyData) {
			await replyData.updateOne({ $push: { text: text } });
			res.send(constents.RESPONES.UPDATE_SUCCESS("update replying"));
		} else {
			const reply = new ReplyModel({
				commentId: commentId,
				text: text,
				replyedBy: userId,
			});
			console.log("reply data=>", reply);

			await reply.save();
			res.send(constents.RESPONES.UPDATE_SUCCESS("replying"));
		}

		// res.send(constents.RESPONES.update)
	} catch (error) {
		console.log(error);
		res.send(constents.RESPONES.ERROR(error));
	}
};

export const getReplys = async (req, res) => {};
