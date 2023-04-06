import mongoose from "mongoose";
import { constents } from "../Constents.js";

const UserSchema = mongoose.Schema(
	{
		email: {
			type: String,
			unique: [true, "email already exists in database!"],
			required: true,
			lowercase: true,
			trim: true,
			validate: {
				validator: function (v) {
					return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
				},
				message: "not a valid email!",
			},
		},
		password: {
			type: String,
			// required: true,
			minlength: [8, "Minimun password length 8"],
			// maxlength: [15, "maximum password length 15"],
		},
		userName: {
			type: String,
			unique: false,
		},
		firstName: {
			type: String,
			// required: [
			// true,
			// "fullname not provided. Cannot create user without firstname ",
			// ],
		},
		lastName: {
			type: String,
		},
		phoneNumber: {
			type: Number,
			trim: true,
			validate: {
				validator: function (v) {
					return /^[0-9]{10}/.test(v);
				},
				message: "not a valid 10 digit number!",
			},
		},
		profileImage: {
			type: Object,
		},
		dateOfBirth: {
			type: Date,
		},
		role: {
			type: Number,
			enum: Object.values(constents.USER_TYPES),
			default: 2,
		},
		visibility: {
			type: Number,
			enum: Object.values(constents.ACCOUNT_TYPE),
			default: 1,
		},
		status: {
			type: String,
			enum: ["Temporary", "Active"],
			default: "Temporary",
		},
		OTP: {
			type: Object,
		},
		profileImage: {
			type: Object,
		},
	},
	{
		timestamps: true,
	}
);

const UserModel = mongoose.model("users", UserSchema);
export default UserModel;

// ghfjjhfjhfj
// module.exports=()=>{
// 	const userModel=sequelize.define([
// 		'require',
// 		'dependency'
// 	], function(require, factory) {
// 		'use strict';

// 	});
// }
