import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
// import path from "node:path";
import bodyParser from "body-parser";
// import process from "node:process";
import cors from "cors";
import fileUpload from "express-fileupload";
import authMiddleWare from "./Middleware/AuthMiddleware.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";


// npm i dotenv
import authRoute from "./Routes/AuthRoute.js";
import postRoute from "./Routes/PostRoute.js";
import userRoute from "./Routes/UserRoute.js";
import uploadRoute from "./Routes/UploadRoute.js";
import messageRoute from "./Routes/MessageRoute.js";
import chatRoomRoute from "./Routes/ChatRoomRoute.js";
import groupChatRoute from "./Routes/GroupChatRoute.js";
import likeRoute from "./Routes/likesRoute.js";
import commentRoute from "./Routes/CommentRoute.js";
import followRoute from "./Routes/followRoutes/RequestRoute.js";
import blockUserRoute from './Routes/UserBlockRoute.js'
import storyRoute from './Routes/StoryRoute.js'
const app = express();


// import io from 'socket.io'

// import { Server } from "socket.io";


// const io = new Server(3001, {
//   cors: {
// 		origin: "*",
// 	},

// });


// io.on("connection", (socket) => {

	
// 	socket.on("connect", (newUserId) => {
// 		console.log("sockectConeent",newUserId);
// 	})
// 	socket.on("disconnect", () => {
// 		console.log("scocket disconnect");
// 	});


// })


// mongoose connect and then call server
mongoose
	.connect(
		// "mongodb+srv://ems:12345@sds.ebmpxjy.mongodb.net/social?retryWrites=true&w=majority" ||
		process.env.DATABASE || dev_db_url,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		}
	)
	.then(() =>
		app.listen(process.env.SERVER_PORT, () => {
			console.log(`Listening at Port ${process.env.SERVER_PORT}`);
		})
	)
	.catch((error) => console.log(`${error} did not connect`));

//view engines setup
app.set("view engine", "ejs");

app.use(bodyParser.json({ limit: "250mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "250mb", extended: true }));
app.use(cors());	
app.use(express.static("./public"));
app.use(express.static("./uploads/files"));
app.use(express.static("./uploads/images"));
app.use(express.static("./uploads/videos"));
app.use(express.static("./public/uploads/files"));
app.use(express.static("./public/uploads/images"));
app.use(express.static("./public/uploads/videos"));


app.use(fileUpload());

app.use("/accounts", authRoute);
app.use("/user", userRoute);
app.use("/posts", postRoute);
app.use("/stories",storyRoute)
app.use("/upload", uploadRoute);
app.use("/message", messageRoute);
app.use("/chatRoom", chatRoomRoute);
app.use("/groupChat", groupChatRoute);
app.use("/likePost",authMiddleWare, likeRoute);
app.use("/comment", commentRoute);
app.use("/follow",followRoute);
app.use("/block",blockUserRoute)

// auth middleware
// app.use((req, res, next) => {
// 	if (!req.url.includes("auth")) {
// 		return authMiddleWare(req, res, next);
// 	}
// 	next();
// });npm iu

// const user = require("./Routes/UserRoute.js");

// const options = {
// 	definition: {
// 		openapi: "3.0.0",
// 		info: {
// 			title: "Hello World",
// 			version: "1.0.0",
// 		},
// 	},
// 	apis: ["./src/routes*.js"], // files containing annotations as above
// };
