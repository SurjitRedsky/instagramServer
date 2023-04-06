import express from "express";
import {
  createPost,
  deletePost,
  getAllPost,
  getPost,
  getPostByType,
  getPostByUser,
  getPostByUserName,
  getPostTesting,
  getPostWithLike,
  getTagList,
  likePost,
  numberOfLikes,
  postByUserTaged,
  removedFromTagList,
  saveVideo,
  tagUserOnPost,
  updatePost,
  uplaodVideoOnFireBase,
  uploadImageOnFireBase,
} from "../Controllers/PostController.js";
const router = express.Router();

//create new post
router.post("/", createPost);
router.post("/saveOnLocal", saveVideo);
router.post("/video", uplaodVideoOnFireBase);
router.post("/image", uploadImageOnFireBase);

//fetch all post
router.get("/", getAllPost);
router.get("/testing/withPopulate/getAllPost", getPostTesting);

//fetch post by userName
router.get("/get-post-byUserName/:userName", getPostByUserName);

//api for like and dislike post
router.put("/:id/like", likePost);

//update post
router.put("/:id", updatePost);

//delete post
router.delete("/:id", deletePost);

///////////////////
router.get("/:id", getPost);
router.get("/:id/likes", getPostWithLike);

// get api's for post by which user
router.get("/get-post-byUser/:userId", getPostByUser);

// search api's for type of images
router.get("/get-post-by-media-type/:type", getPostByType);

//api for get number of likes using post id
router.get("/number-of-likes/:id", numberOfLikes);

/****************************************************
 ************* Routes for tag controller ************/
//api for tag a user
router.put("/taged-user-on-post/:postId", tagUserOnPost);

//update api for remove from tag list
router.put("/remove-user-from-tagList/:postId/:userId", removedFromTagList);

// get api's for list of taged people
router.get("/get-taged-user-list-by-postId/:postId", getTagList);

//get api's for which user are taged
router.get("/get-post-which-user-taged/:userId", postByUserTaged);

export default router;
