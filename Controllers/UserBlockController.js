import blockUserModel from "../Models/BlockListModel.js";
import jwt from "jsonwebtoken";
import { constents } from "../Constents.js";

/**********************************************************
 ***************** API for block user  *****************/
export const blockUser = async (req, res) => {
  try {
    //authonticate
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWTKEY);
    const currentUserId = decoded.id;

    const { userId } = req.params;

    //check block is exist of currentUser
    const list = await blockUserModel.findOne({ userId: currentUserId });

    //first check block document is exits
    if (list !== null) {
      // list.blockedUsers.includes(userId)?
      await list.updateOne({ $push: { blockedUsers: userId } });
    } else {
      const block = new blockUserModel({
        userId: currentUserId,
        blockedUsers: userId,
      });
      await block.save();
    }

    res.send(constents.RESPONES.UPDATE_SUCCESS("User succesfully blocked"));
  } catch (error) {
    res.send(constents.RESPONES.ERROR(error));
  }
};

/**********************************************************
 ***************** API for unblock user  *****************/
export const unBlockUser = async (req, res) => {
  try {
    //authonticate
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWTKEY);
    const currentUserId = decoded.id;

    const { userId } = req.params;

    // const list = await blockUserModel.findOne({ userId: currentUserId });
    const list = await blockUserModel.findOne({ userId: currentUserId });

    list !== null
      ? (await list.updateOne({ $pull: { blockedUsers: userId } }),
        res.send(constents.RESPONES.UPDATE_SUCCESS("succesfully unblock")))
      : res.send(constents.RESPONES.NO_DATA("No User"));
  } catch (error) {
    console.log(error);
    res.send(constents.RESPONES.ERROR(error));
  }
};
