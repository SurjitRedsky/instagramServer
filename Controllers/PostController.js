//import required model and mongoose
import mongoose from "mongoose";
import postModel from "../Models/PostModel.js";
import likeModel from "../Models/postModel/LikesModel.js";
import CommentModel from "../Models/postModel/CommentModel.js";

import path from "path";
import jwt from "jsonwebtoken";
import imageThumbnail from "image-thumbnail";
import fs from "fs";
import { v1 } from "uuid";
import { constents } from "../Constents.js";

const secret = process.env.JWTKEY;
const __dirname = path.resolve();

//file upload
import admin from "firebase-admin";
import serviceAccount from "../firebase_keys.js";

/**************************************
 **********  create post  *************/
export const createPost = async (req, res) => {
  //auth user
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWTKEY);
  const userId = decoded.id;

  // set userId
  const newPost = new postModel(req.body);
  newPost.userId = userId;

  try {
 
    if (req.body.type === 1) {
      const __dirname = path.resolve();
      const uuid = v1();

      const image = newPost.media[0].url.uri;
      async function saveImage(baseImage) {
        /*path of the folder where your project is saved. (In my case i got it from config file, root path of project).*/
        const uploadPath = __dirname;

        //path of folder where you want to save the image.
        const localPath = `${uploadPath}/uploads/images/`;

        //Find extension of file
        const ext = baseImage.substring(
          baseImage.indexOf("/") + 1,
          baseImage.indexOf(";base64")
        );
        const fileType = baseImage.substring(
          "data:".length,
          baseImage.indexOf("/")
        );

        //Forming regex to extract base64 data of file.
        const regex = new RegExp(`^data:${fileType}\/${ext};base64,`, "gi");

        //Extract base64 data.
        const base64Data = baseImage.replace(regex, "");
        const filename = `${uuid}.${ext}`;

        //Check that if directory is present or not.
        if (!fs.existsSync(`${uploadPath}/uploads/`)) {
          fs.mkdirSync(`${uploadPath}/uploads/`);
        }
        if (!fs.existsSync(localPath)) {
          fs.mkdirSync(localPath);
        }
        fs.writeFileSync(localPath + filename, base64Data, "base64");

        //convert image into base64 String
        const file = localPath + filename;
        newPost.media[0].url.uri =
          "data:image/jpeg;base64," + fs.readFileSync(file, "base64");

        //make thumbnail of iamge
        let options = { width: 120, height: 120, responseType: "base64" };
        const thumbnail = await imageThumbnail(`${file}`, options);

        return thumbnail;
      }

      //store thumbnail to database
      // newPost.userId = userId;

      const thumbnailUrl = await saveImage(image);
      newPost.media[0].thumbnail = {
        uri: `data:image/jpeg;base64,${thumbnailUrl}`,
      };
      //send postId to likes model
      const newLike = new likeModel({ postId: newPost._id });

      await newPost.save();
      await newLike.save();
      res.send(constents.RESPONES.SUCCESS(newPost, "post upload succesfully"));
 
    } else {
      newPost.visibilty = "private";
      await newPost.save();
      res.send(constents.RESPONES.SUCCESS(newPost, "story upload succesfully"));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

/*****************************************************
 *********** store video in local storage ************/
export const saveVideo = async (req, res) => {
  // console.log("body data=>", req.files);

  const saveVideo = (payload) => {
    // console.log("payload->", payload);

    if (payload) {
    }
    let fileName = Date.now() + "_" + payload.files.name;

    let directoryPath = path.resolve(__dirname + `/uploads/files`);

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }

    let fileSavePath = `${directoryPath}/${fileName}`;
    let writeStream = fs.createWriteStream(fileSavePath);
    return new Promise((resolve, reject) => {
      writeStream.write(payload.files.data);
      writeStream.on("error", function (err) {
        reject(err);
      });
      writeStream.end(function (err) {
        if (err) {
          // console.log("error -->", err);
          reject(err);
        } else {
          let fileUrl = `${process.env.BASE_URL}/uploads/files/${fileName}`;

          resolve(fileUrl);
          // console.log("file url", fileUrl);
        }
      });
    });
  };
};

/****************************************************
 ************** store video on fireBase *************/
export const uplaodVideoOnFireBase = async (req, res) => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://instagram-clone-378510.appspot.com/",
  });
  // gs://instagram-clone-378510.appspot.com/postVideo

  const bucket = admin.storage().bucket();

  try {
    const file = req.files.file;

    if (!file) {
      throw new Error("Please upload a file");
    }

    const filename = `${Date.now()}-${file.name}`;
    const blob = bucket.file(filename);

    const stream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      predefinedAcl: "publicRead", // Set file access to public-read
    });

    stream.on("error", (error) => {
      console.log(error);
      throw new Error(error);
    });

    stream.on("finish", async () => {
      const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      res.status(200).send({
        message: "File uploaded successfully",
        url,
      });
    });

    stream.end(file.buffer);
  } catch (error) {
    res.status(500).send({
      message: "An error occurred while uploading the file",
      error: error.message,
    });
    console.log(error);
  }
};

/****************************************************
 ************** store Image on fireBase *************/
export const uploadImageOnFireBase = async (req, res) => {
  console.log("image api is running ");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://instagram-clone-378510.appspot.com/",
  });

  const bucket = admin.storage().bucket();

  try {
    const file = req.files.file;

    if (!file) {
      throw new Error("Please upload a file");
    }

    const filename = `${Date.now()}-${file.name}`;
    const blob = bucket.file(filename);

    const stream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      predefinedAcl: "publicRead", // Set file access to public-read
    });

    stream.on("error", (error) => {
      console.log(error);
      throw new Error(error);
    });

    stream.on("finish", async () => {
      const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      res.status(200).send({
        message: "File uploaded successfully",
        url,
      });
    });

    stream.end(file.buffer);
  } catch (error) {
    res.status(500).send({
      message: "An error occurred while uploading the file",
      error: error.message,
    });
    console.log(error);
  }
};

/****************************************************
 *************** API for delete post  **************/
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await postModel.findById(id);
    const likeData = await likeModel.findOne({ postId: id });
    if (post.userId === userId) {
      await post.deleteOne();
      await likeData.deleteOne();
      res.send(constents.RESPONES.UPDATE_SUCCESS("post deleted succesfully"));
    } else {
      res.send(constents.RESPONES.ACCESS_DENIED());
      // res.status(403).json({ success: false, message: "Action forbidden" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

/****************************************************
 *************** API for update post  **************/
export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, secret);
  const userId = decoded.id;

  try {
    const post = await postModel.findById(postId);
    if (post.userId === userId) {
      await post.updateOne({ $set: req.body });
      res.send(constents.responseType.UPDATE_SUCCESS("Post updated!"));
      // res.status(200).json({ success: true, message:  });
    } else {
      res.send(constents.RESPONES.ACCESS_DENIED());
      // res
      // 	.status(403)
      // 	.json({ success: false, message:  });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

/****************************************************
 ********** API for like & dislike post  ************/
export const likePost = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id;

    const postId = req.params.id;

    const likeData = await likeModel.findOne({ postId: postId });
    console.log(likeData.users);
    if (likeData.users.includes(userId)) {
      await likeData.updateOne({ $pull: { users: userId } });
      res.send(constents.RESPONES.UPDATE_SUCCESS("post was disLiked"));
    } else {
      await likeData.updateOne({ $push: { users: userId } });
      res.send(constents.RESPONES.UPDATE_SUCCESS("post was liked"));
    }
  } catch (error) {
    res.send(constents.RESPONES.ERROR(error));
    console.log(error);
  }
};

/****************************************************
 ************* API for get all posts  **************/
export const getAllPost = async (req, res) => {
  try {
    const data = await postModel.aggregate([
      {
        $lookup: {
          from: "likes",
          foreignField: "postId",
          localField: "_id",
          as: "likes",
        },
      },
      {
        $unwind: {
          path: "$likes",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "comments",
          foreignField: "postId",
          localField: "_id",
          as: "comments",
        },
      },
      // {
      // 	$unwind: {
      // 		path: "$comments",
      // 		preserveNullAndEmptyArrays: true,
      // 	},
      // },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "userId",
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
        $project: {
          media: {
            url: 1,
          },
          content: 1,
          tag: 1,
          visibilty: 1,
          createdAt: 1,
          isLiked: 1,
          userName: "$user.userName",
          profileImage: "$user.profileImage.thumbnail",
          likes: {
            users: "$likes.users",
          },
          comments: {
            text: "$comments.text",
            commentedBy: "$comments._id",
            likesOnComments: "$comments.likesOnComments",
          },
        },
      },
    ]);
    if (data === null) {
      res.send(constents.RESPONES.NO_DATA("No post avialable "));
    } else {
      res.send(constents.RESPONES.SUCCESS(data));
    }
  } catch (error) {
    res.send(constents.RESPONES.ERROR(error));
    console.log(error);
  }
};

/****************************************************
 ************* API for GET post by ID  **************/
export const getPost = async (req, res) => {
  // const id = req.params.id;
  const id = mongoose.Types.ObjectId(req.params.id);
  // const post = await postModel.findById(id);
  const post1 = await postModel.aggregate([
    {
      $match: { _id: id },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "userId",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "comments",
        foreignField: "postId",
        localField: "_id",
        as: "comments",
      },
    },
  ]);
  try {
    res.status(200).json(post1);
  } catch (error) {
    res.status(500).json(error);
  }
};

/****************************************************
 *********** API for GET post with likes ************/
export const getPostWithLike = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  try {
    const post = await postModel.aggregate([
      {
        $lookup: {
          from: "likes",
          foreignField: "postId",
          localField: "_id",
          as: "likes",
        },
      },

      {
        $unwind: "$likes",
      },

      {
        $match: { _id: id },
      },
      {
        $project: { likes: 1 },
      },
      {
        $lookup: {
          from: "posts",
          foreignField: "_id",
          localField: "postId",
          as: "post",
        },
      },
    ]);
    res.status(202).json(post[0].likes);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
};

/****************************************************
 ************ API for GET post by userId  **********/
export const getPostByUser = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.userId);

  try {
    // const post = await postModel.find({ userId: id });
    const post = await postModel.aggregate([
      {
        $match: { userId: id },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "userId",
          as: "user",
        },
      },
    ]);

    if (post.length !== 0) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ success: false, message: "No Post By this User" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

/****************************************************
 *************** search API for posts **************/
export const getPostByType = async (req, res) => {
  const { type } = req.params;
  console.log("post type -:-", type);
  try {
    const post = await postModel.find({
      media: { $elemMatch: { type: `${type}` } },
    });
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(403).json("Action not performed");
    }
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
};

/* 16-03-23 */
/****************************************************
 *********** API for taged user on post ************/
export const tagUserOnPost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.body.userId;
  try {
    const userIsTaged = await postModel.findById(postId);
    if (userIsTaged.tag.includes(userId)) {
      // console.log("userAlready tagged");
      res.send(
        constents.RESPONES.UPDATE_SUCCESS(
          `${userId} user already tagged on this post`
        )
      );
    } else {
      await userIsTaged.updateOne({ $push: { tag: userId } });
      res.send(
        constents.RESPONES.UPDATE_SUCCESS(
          `user ${userId} are tagged on this post`
        )
      );
    }
  } catch (error) {
    res.send(constents.RESPONES.ERROR(error));
  }
};

/****************************************************
 ******** API for find post by taged userId *********/
export const postByUserTaged = async (req, res) => {
  const { userId } = req.params;
  try {
    const post = await postModel.find({
      tag: { $elemMatch: { $eq: userId } },
    });

    post.length > 0
      ? res.send(constents.RESPONES.SUCCESS(post))
      : res.send(
          constents.RESPONES.NO_DATA("This Person was not taged with any post")
        );
  } catch (error) {
    res.send(constents.RESPONES.ERROR(error));
  }
};

/****************************************************
 ********* API for get tag list by postId ***********/
export const getTagList = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await postModel.findById(postId);
    post
      ? post.tag.length > 0
        ? res.send(constents.RESPONES.SUCCESS(post.tag))
        : res.send(
            constents.RESPONES.NO_DATA("No User are taged with this Post !")
          )
      : res.send(constents.RESPONES.NO_DATA("No Post Avialable !"));
  } catch (error) {
    res.send(constents.RESPONES.ERROR(error));
  }
};

/****************************************************
 ******** API for remove user from tag list *********/
export const removedFromTagList = async (req, res) => {
  const { postId, userId } = req.params;
  try {
    const post = await postModel.findById(postId);
    post
      ? post.tag.includes(userId)
        ? (await post.updateOne({ $pull: { tag: userId } }),
          res.send(
            constents.RESPONES.SUCCESS("Succesfully Removed from Tag list. ")
          ))
        : res.send(
            constents.RESPONES.NO_DATA(
              "This User was Not tagged with any post !"
            )
          )
      : res.send(constents.RESPONES.NO_DATA("No Post Available !"));
  } catch (error) {
    res.send(constents.RESPONES.ERROR(error));
  }
};

// remove taged user from tag list
// export const removeTagedUser = async (req, res) => {
//   const postId = req.params.id;

//   const userId = req.params.userId;
//   try {
//     const isTaged = await postModel.findById(postId);
//     const listTaged = isTaged.tag;
//     if (listTaged.includes(`${userId}`)) {
//       const post = await postModel.findOneAndUpdate(
//         { _id: postId },
//         { $pull: { tag: `${userId}` } }
//       );
//       res.status(200).json("tag list updated");
//     }
//     res.status(200);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// };

// };

// const uploadFile = (file) => {
// var serviceAccount=require('../firebase_keys.json')

// 	try {
// 		admin.initializeApp({
// 			credential: admin.credential.cert(serviceAccount),
// 			storageBucket:"gs://notificationtest-69b51.appspot.com/"
// 		});

// 		const upload =multer({
// 			storage:multer.memoryStorage()
// 			limits:{
// 				fileSize:5*1024*1024
// 			}
// 		})
// 		const bucket = admin.storage().bucket();

// Upload a file to Firebase Storage
// 	const bucket = admin
// 		.storage()
// 		.bucket();
// 	console.log("bucket ->");
// 	const filePath = file;
// 	const destination = req.files.files.name;
// 	console.log("---------->>", destination);
// 	bucket
// 		.upload(filePath, {
// 			destination: destination,
// 			metadata: {
// 				contentType: "video/mp4",
// 			},
// 		})
// 		.then(() => {
// 			console.log("File uploaded successfully.");
// 		})
// 		.catch((error) => {
// 			console.error("Error uploading file:", error);
// 		});
// } catch (error) {
// 	console.log("error->", error);
// }
// };

// 	try {
// 		// console.log("request file ->", req.files);
// 		saveVideo(req.files)
// 			.then((data) => {
// 				uploadFile(data);
// 				res.send(data);
// 			})
// 			.catch((err) => {
// 				// console.log("err->", err);
// 				res.send(err);
// 			});
// 	} catch (error) {
// 		res.send(error);
// 		console.log(error);
// 	}
// };
/****************************
 * upload video on fireBase *
 ****************************/

// try {
// 	res.send("post save");
// } catch (error) {
// 	res.send(error);
// 	console.log("err->", error);
// }

//FILE UPLOAD SERVICE
// fileUploadService.uploadFileToLocal = async (
// 	payload,
// 	pathToUpload,
// 	pathOnServer
// ) => {
// 	let fileName = Date.now() + "_" + payload.file.originalname;
// 	let directoryPath = pathToUpload
// 		? pathToUpload
// 		: path.resolve(
// 				__dirname + `../../..${CONFIG.PATH_TO_UPLOAD_SUBMISSIONS_ON_LOCAL}`
// 		  );
// 	// create user's directory if not present.
// 	if (!fs.existsSync(directoryPath)) {
// 		fs.mkdirSync(directoryPath);
// 	}
// 	let fileSavePath = `${directoryPath}/${fileName}`;
// 	let writeStream = fs.createWriteStream(fileSavePath);
// 	return new Promise((resolve, reject) => {
// 		writeStream.write(payload.file.buffer);
// 		writeStream.on("error", function (err) {
// 			reject(err);
// 		});
// 		writeStream.end(function (err) {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				let fileUrl = pathToUpload
// 					? `${CONFIG.SERVER_URL}${pathOnServer}/${fileName}`
// 					: `${CONFIG.SERVER_URL}${CONFIG.PATH_TO_UPLOAD_SUBMISSIONS_ON_LOCAL}/${fileName}`;
// 				resolve(fileUrl);
// 			}
// 		});
// 	});
// };
//get all posts =====================

export const getPostTesting = async (req, res) => {
  try {
    const data = await postModel
      .find({}, { media: 1 })
      .populate({ path: "userId", select: ["userName"] })
      .populate({
        ref: "post",
        path: "_id",
        foreignField: "postId",
        select: "users",
        model: likeModel,
      })
      .populate({
        ref: "post",
        path: "_id",
        foreignField: "postId",
        model: CommentModel,
      });

    console.log("dataFromPostAPI=>", data);
    res.send(constents.RESPONES.SUCCESS(data));
  } catch (error) {
    console.log(error);
    res.send(constents.RESPONES.ERROR(error));
  }
};

//getPost by userName ==================
export const getPostByUserName = async (req, res) => {
  const { userName } = req.params;
  console.log("userName", userName);

  try {
    const post = await postModel.aggregate([
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "userId",
          as: "user",
        },
      },
      {
        $match: { "user.userName": `${userName}` },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "likes",
          foreignField: "postId",
          localField: "_id",
          as: "likes",
        },
      },
      {
        $unwind: "$likes",
      },
      {
        $lookup: {
          from: "comments",
          foreignField: "postId",
          localField: "_id",
          as: "comments",
        },
      },
      {
        $project: {
          media: 1,
          content: 1,
          tag: 1,
          visibilty: 1,
          createdAt: 1,
          isLiked: 1,
          userName: "$user.userName",
          profileImage: "$user.profileImage",
          likes: {
            users: "$likes.users",
          },
          comments: {
            text: "$comments.text",
            commentedBy: "$comments._id",
          },
        },
      },
    ]);
    console.log("serverside->", post);
    if (post.length !== 0) {
      res.send(constents.RESPONES.SUCCESS(post));
      // res.status(200).json(post);
    } else {
      res.send(constents.RESPONES.NO_DATA("No Post By this User"));
      // res.status(404).json({ success: false, message: "" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//----->> number of likes for one post
export const numberOfLikes = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await postModel.findById(id);
    res.status(200).json(post.likes);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};
