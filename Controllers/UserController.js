import userModel from "../Models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { constents } from "../Constents.js";
import mongoose from "mongoose";
import blockUserModel from "../Models/BlockListModel.js";


// *******************************************
export const currentUser =async (req,res)=>{

console.log("user->",req.user);
  const user =req.user
  try {
  const data= await userModel.findById(user.id)
  data.length === 0
  ? res.send(constents.RESPONES.NO_DATA("No data"))
  : res.send(constents.RESPONES.SUCCESS({data}, "successfully get user"))
} catch (error) {
  res.send(constents.RESPONES.ERROR(error))
}
}

/********************************************
 ********** API for get all user ***********/
export const getAllUsers = async (req, res) => {
  try {
    let users = await userModel.find();
    users = users.map((user) => {
      const { password, ...otherDetails } = user._doc;
      return otherDetails;
    });
    res.send(
      constents.RESPONES.SUCCESS(
        {users},
        constents.RESPONES.USER_MESSAGE.ALL_USER
      )
    );
  } catch (error) {
    res.send(constents.RESPONES.ERROR(error));
  }
};


/********************************************
 *** API for search user by given char  *****/
export const getUserByNameStart = async function (req, res) {
  const { char } = req.params;
  try {
    //get block list of current user
    let blockList = await blockUserModel.findOne({ userId: currentUserId });

    // get user
    let user = await userModel.find({
      firstName: { $regex: `^${char}` },
      _id: { $nin: blockList.blockedUsers },
    });

    if (user) {
      res.send(
        constents.RESPONES.SUCCESS(
          user,
          constents.RESPONES.USER_MESSAGE.ALL_USER
        )
      );
    } else {
      res.send(constents.RESPONES.NO_DATA());
    }
  } catch (error) {
    res.send(constents.RESPONES.ERROR());
  }
};

/********************************************
 ***** API for GET user by name pattern  ****/
export const getUserByNamePattern = async function (req, res) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWTKEY);
  const currentUserId = decoded.id;

  const { pattern } = req.params;
  try {
    //get block list of current user
    let blockList = await blockUserModel.findOne({ userId: currentUserId });

    // get user
    let user = await userModel.find({
      firstName: { $regex: `${pattern}` },
      _id: { $nin: blockList.blockedUsers },
    });

    user.length === 0
      ? res.send(constents.RESPONES.NO_DATA("No data"))
      : res.send(constents.RESPONES.SUCCESS(user, "successfully get all user"));
  } catch (error) {
    console.log(error);
    res.send(constents.RESPONES.ERROR());
  }
};

/*********************************************
 ** API for GET user by name end with char **/
export const getUserByNameEnd = async function (req, res) {
  const { char } = req.params;
  try {
 //get block list of current user
 let blockList = await blockUserModel.findOne({ userId: currentUserId });

 // get user
 let user = await userModel.find({
   firstName: { $regex: `${char}$` },
   _id: { $nin: blockList.blockedUsers },
 });

    
   
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json("No Such User name end with this char");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

/********************************************
 ******* API for get user by userName *******/
export const getUserByUserName = async (req, res) => {
  const { pattern } = req.params;
  try {
  
    //get block list of current user
 let blockList = await blockUserModel.findOne({ userId: currentUserId });

 // get user
 let user = await userModel.find({
   firstName: { $regex: `${pattern}` },
   _id: { $nin: blockList.blockedUsers },
 });


    if (user) {
      
      res.status(200).json(user);
    } else {
      res.status(404).json("No Such User with this userName");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

/********************************************
 ******* API for update user details ********/
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserAdmin, password } = req.body;
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWTKEY);
  const userId = decoded.id;

  if (id === userId) {
    try {
      // console.log("password -->>", password);
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
        // console.log("crypt pss-->>>", req.body.password);
      }

      // have to change this
      const user = await userModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      const token = jwt.sign(
        { username: user.username, id: user._id },
        process.env.JWTKEY,
        { expiresIn: "24h" }
      );
      // console.log({ user, token });
      // res.status(200).json({ user, token });
      res.send(
        constents.RESPONES.SUCCESS(
          { user, token },
          constents.RESPONES.USER_MESSAGE.USER_UPDATE
        )
      );
    } catch (error) {
      res.send(constents.RESPONES.ERROR());
    }
  } else {
    // res.status(403).json({
    // 	success: false,
    // 	message: "Access Denied! You can update only your own Account.",
    // });
    res.send(constents.RESPONES.ACCESS_DENIED());
  }
};

/********************************************
 *********** API for delete user ************/
export const deleteUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId, currentUserAdmin } = req.body;

  if (currentUserId == id || currentUserAdmin) {
    try {
      await userModel.findByIdAndDelete(id);
      res.send(
        constents.RESPONES.SUCCESS(
          "",
          constents.RESPONES.USER_MESSAGE.USER_DELETE
        )
      );
      // res
      // 	.status(200)
      // 	.json({ success: true, message: "User Deleted Successfully!" });
    } catch (error) {
      // res.status(500).json(err);
      res.send(constents.RESPONES.ERROR(error));
    }
  } else {
    // res.status(403).json({ success: false, message: "Access Denied!" });
    res.send(constents.RESPONES.INVALID_USERNAME_PASSWORD());
  }
};

/********************************************
 ***** API for get user with all data *******/
export const getUser = async (req, res) => {
  // console.log("secretKey--->>", secret);
  // const token = req.headers.authorization;
  // console.log("token--->>", token);
  // const decoded = jwt.verify(token, secret);
  // const userId = decoded.id;
  // console.log("userId--->", userId);

  const userId = req.params.id;
  console.log("userId==>", userId);
  try {
    
        const token = req.headers.authorization;
        console.log("token->",process.env.JWTKEY);

        const decoded = jwt.verify(token, process.env.JWTKEY)
        console.log("decoded-->",decoded);

        const currentUserId = decoded.id;

    const list = await blockUserModel.findOne({ userId: currentUserId });

    // console.log( list.blockedUsers.includes(userId));
    if (list?.blockedUsers?.includes(userId)) {
      const data = await userModel.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(userId) },
        },

        {
          $lookup: {
            from: "posts",
            localField: "_id",
            foreignField: "userId",
            as: "posts",
          },
        },
        {
          $lookup: {
            from: "followers",
            localField: "_id",
            foreignField: "userId",
            as: "followData",
          },
        },
        {
          $unwind: {
            path: "$followData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            role: 1,
            visibility: 1,
            status: 1,
            dateOfBirth: 1,
            userName: 1,
            profileImage: { thumbnail: 1 },
          },
        },
      ]);
      res.send(constents.RESPONES.SUCCESS(data[0]));
    } else {
      const data = await userModel.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(userId) },
        },

        {
          $lookup: {
            from: "posts",
            localField: "_id",
            foreignField: "userId",
            as: "posts",
          },
        },
        {
          $lookup: {
            from: "followers",
            localField: "_id",
            foreignField: "userId",
            as: "followData",
          },
        },
        {
          $unwind: {
            path: "$followData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            role: 1,
            visibility: 1,
            status: 1,
            dateOfBirth: 1,
            userName: 1,
            profileImage: { thumbnail: 1 },
            posts: {
              media: {
                thumbnail: 1,
              },
            },
            followData: 1,
          },
        },
      ]);
      res.send(constents.RESPONES.SUCCESS(data[0]));
    }
  } catch (error) {
    console.log("error from get user by id api", error);
    res.send(constents.RESPONES.ERROR(error));
  }
};

// export const getUser = async (req, res) => {
// 	const id = req.params.id;
// 	const user = await userModel.findById(id);
// 	try {
// 		if (user) {
// 			const { password, ...otherDetails } = user._doc;
// 			res.send(
// 				constents.RESPONES.SUCCESS(
// 					otherDetails,
// 					constents.RESPONES.USER_MESSAGE.USER_ID
// 				)
// 			);
// 		} else {
// 			res.send(constents.RESPONES.NO_DATA());
// 		}
// 	} catch (error) {
// 		res.send(constents.RESPONES.ERROR(error));
// 	}
// };

// Follow a User
// changed
// export const followUser = async (req, res) => {
// 	const id = req.params.id;
// 	const { _id } = req.body;
// 	// console.log(id, _id);
// 	if (_id == id) {
// 		res.status(403).json({
// 			success: false,
// 			message: "Action Forbidden",
// 		});
// 	} else {
// 		try {
// 			const followUser = await userModel.findById(id);
// 			const followingUser = await userModel.findById(_id);

// 			if (!followUser.followers.includes(_id)) {
// 				await followUser.updateOne({ $push: { followers: _id } });
// 				await followingUser.updateOne({ $push: { following: id } });
// 				res.status(200).json({ success: true, message: "User followed!" });
// 			} else {
// 				res.status(403).json({
// 					success: false,
// 					message: "you are already following this id",
// 				});
// 			}
// 		} catch (error) {
// 			// console.log(error);
// 			res.status(500).json(error);
// 		}
// 	}
// };

// Unfollow a User
// changed
// export const unfollowUser = async (req, res) => {
// 	const id = req.params.id;
// 	const { _id } = req.body;

// 	if (_id === id) {
// 		res.status(403).json({
// 			success: false,
// 			message: "Action Forbidden",
// 		});
// 	} else {
// 		try {
// 			const unFollowUser = await userModel.findById(id);
// 			const unFollowingUser = await userModel.findById(_id);

// 			if (unFollowUser.followers.includes(_id)) {
// 				await unFollowUser.updateOne({ $pull: { followers: _id } });
// 				await unFollowingUser.updateOne({ $pull: { following: id } });
// 				res.status(200).json({
// 					success: true,
// 					message: "Unfollowed Successfully!",
// 				});
// 			} else {
// 				res.status(403).json({
// 					success: false,
// 					message: "You are not following this User",
// 				});
// 			}
// 		} catch (error) {
// 			res.status(500).json(error);
// 		}
// 	}
// };
