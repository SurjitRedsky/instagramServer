import express from "express";
import {
  addBirthday,
  addProfileImages,
  checkUserPresent,
  confirmation,
  loginUser,
  registerUser,
  resend,
  sendConfirmationCode,
  sendForgotPasswordLink,
  setUserName,
  sginUpUser,
} from "../Controllers/AuthController.js";
import authMiddleWare from "../Middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.put("/add/:id", addBirthday);
router.post(`/signUp/:id`, sendConfirmationCode);
router.put(`/verified/:id`, confirmation);
router.put(`/verified/resend/:id`, resend);
router.put(`/signUp/user/:id`, sginUpUser);
router.put(`/signUp/user/profile/:id`, addProfileImages);
router.post("/createUserName", setUserName);

router.get(`/checkUser/:userName`,checkUserPresent)
router.post(`/challegeTrue/sendLink/:userName`,sendForgotPasswordLink)

export default router;
