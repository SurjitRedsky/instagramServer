import express from "express";
import {
	addBirthday,
	addProfileImages,
	confirmation,
	loginUser,
	registerUser,
	resend,
	sendConfirmationCode,
	setUserName,
	sginUpUser,
	// sendMail,
	// tryApi,
	// userConfirmation,
} from "../controllers/AuthController.js";
import authMiddleWare from "../Middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.put("/add/:id",addBirthday)
router.post(`/signUp/:data`, sendConfirmationCode);
router.put(`/verified/:id`, confirmation);
router.put(`/verified/resend/:id`, resend);
router.put(`/signUp/user/:id`, sginUpUser);
router.put(`/signUp/user/profile/:id`, addProfileImages);
router.post("/createUserName", setUserName);

export default router;
