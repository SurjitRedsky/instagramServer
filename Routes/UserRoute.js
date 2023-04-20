import express from "express";
import {
	deleteUser,
	getAllUsers,
	getUser,
	getUserByNameEnd,
	getUserByNamePattern,
	getUserByNameStart,
	updateUser,
	// followUser,
	// unfollowUser,
	getUserByUserName,
	currentUser,
} from "../Controllers/UserController.js";

const router = express.Router();

router.get("/", getAllUsers);
// router.get("/", getttalll);
router.get("/currentUser",currentUser)


// router.get("/:id", getUser);
router.get("/:id", getUser);

router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

//search api for user by userName
router.get("/search-by-userName/:userName", getUserByUserName);

// Search apis for user First Name
router.get("/search-by-name-pattern/:pattern", getUserByNamePattern);
router.get("/search-name-start-with/:char", getUserByNameStart);
router.get("/search-name-end-with/:char", getUserByNameEnd);

//following and unfollower Api
// router.put("/:id/follow", followUser);
// router.put("/:id/unfollow", unfollowUser);
// const swaggerOption = {
// 	swaggerDefination: {
// 		info: {
// 			title: "User API",
// 			description:
// 				"The API for all users that have Account on instagram platform",
// 			contact: "Redsky Developers",
// 			servers: ["http://localhost:4000"],
// 		},
// 	},
// 	// give the file of user routes
// 	api: ["./Routes/UserRoute.js"],
// };

// const swaggerDocs = swaggerJSDoc(swaggerOption);
// router.use("api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

export default router;
