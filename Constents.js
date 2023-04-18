export let constents = {};

constents.USER_TYPES = {
	ADMIN: 1,
	USER: 2,
};

// constents.MEDIA_TYPES={
// 	POST:'POST',
// 	STORY:'STORY',
// 	REEL:'REEL'
// }
constents.MEDIA_TYPES={
	POST:1,
	STORY:2,
	REEL:3
}


constents.REQUEST_STATUS = {
	REQUESTED: 0,
	REQUEST_ACCEPT: 1,
	// FOLLOWING: 1,
	// FOLLOW: 2,
};

constents.ACCOUNT_TYPE = {
	PUBLIC: 1,
	PRIVATE: 2,
};

constents.SEND_MAIL = {
	user: "surjitkajal9669@gmail.com",
	password: "uyossqqsanodkrzt",
	// user: "surjitsingh,redskyatech@gmail.com",
	// password: "9trD3iCaTPU@bCY",
};

constents.SUCCESS = {};

constents.RESPONES = {
	SUCCESS: (data, message) => {
		return {  ...data,statusCode: 200, message };
	},
	UPDATE_SUCCESS: (message) => {
		return {
			statusCode: 200,
			message,
		};
	},
	PENDING_SUCCESS: (data, message) => {
		return {
			data,
			statusCode: 202,
			message: "select UserName from suggested names",
		};
	},
	ERROR: (err, errorcode = 500, message = "Error Found") => {
		return {
			err: err,
			statusCode: errorcode,
			message,
		};
	},
	INVALID_USERNAME_PASSWORD: () => {
		return {
			statusCode: 400,
			message: "Wrong Password",
		};
	},
	ACCESS_DENIED: () => {
		return {
			statusCode: 403,
			message: "Access Denied!",
		};
	},
	NO_DATA: (message) => {
		return {
			statusCode: 404,
			message,
		};
	},
	CONFLICT: () => {
		return {
			statusCode: 409,
			message: "User already exists",
		};
	},
	OTP_EXPIRED: () => {
		return {
			statusCode: 401,
			message: "That code was expired. You can request a new One.",
		};
	},
	WRONG_CODE: () => {
		return {
			statusCode: 400,
			message: "That code isn't valid. You can request a new one.",
		};
	},

	USERNAME_SUCCESS: (data, isAvailable) => {
		return {
			data,
			statusCode: 200,
			isAvailable,
		};
	},
	LOGIN_MESSAGE: {
		FOR_LOGIN: "Your Login Succesfully",
		FOR_EMAIL: "User not exist ",
		FOR_PASSWORD: "Incorrect password",
		FOR_USER_EXIST: "User already exists",
	},
	USER_MESSAGE: {
		ALL_USER: "All users fetch successfully.",
		USER_ID: "User Find with ID successfully.",
		USER_NAME_PATTERN: "User find successfully with this name pattern",
		USER_STATUS: "User Find with status successfully.",
		USER_UPDATE: "User Updated successfully.",
		USER_DELETE: "User Deleted successfully.",
		USER_INSERT: "User Inserted successfully.",
	},
	SGINUP_MESSAGE: {
		SGINUP: "Account has been created successfully",
	},
	SEND_CODE: {
		NUMBER_VERIFICATION: "Successfully sent SMS",
		EMAIL_VERIFICATION: "Successfully sent OTP",
		INVALID_DATA: "Invalid Parameters",
	},
	VERIFICATION: {
		WRONG_CODE: "That code isn't valid. You can request a new one.",
		OTP_EXPIRE: "That code was expired. You can request a new One.",
		VERIFIED: "Verified",
		NO_USER: "Request was not found for this user",
		RESEND_WAIT: "An email is on its way.",
		RESEND_CODE: "Your code was resent.",
	},
};

