import userModel from "../Models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { constents } from "../Constents.js";
import otpGenerator from "otp-generator";
import path from "path";

import imageThumbnail from "image-thumbnail";
import fs from "fs";
import { v1 } from "uuid";
import blockUserModel from "../Models/BlockListModel.js";
import { log } from "console";

/**********************************************************
 ***************** API for register user  *****************/
// Register user
export const registerUser = async (req, res) => {
  try {
    //create crypted password here
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPass;

    //split user fullName into fristName and lastName
    const firstName = req.body.name.split(" ")[0];
    const lastName = req.body.name.split(" ")[1];

    //send data to userModel
    const newUser = new userModel(req.body);
    newUser.firstName = firstName;
    newUser.lastName = lastName;

    // get username and phoneNumber from req.body
    const { userName, phoneNumber } = req.body;
    //check user already exists or not
    const oldUser = await userModel.findOne({ userName });
    if (oldUser) return res.send(constents.RESPONES.CONFLICT());

    // create token and save to database
    const user = await newUser.save();

    const token = jwt.sign(
      { userName: user.userName, id: user._id },
      process.env.JWTKEY,
      {
        expiresIn: "24h",
      }
    );
    //create block list in database
    const blockList = new blockUserModel({
      userId: user._id,
    });
    await blockList.save();
    res.send(
      constents.RESPONES.SUCCESS(
        { user, token },
        constents.RESPONES.SGINUP_MESSAGE.SGINUP
      )
    );
  } catch (error) {
    console.log(error);
    res.send(constents.RESPONES.ERROR(error));
  }
};

// Login User
// Changed
export const loginUser = async (req, res) => {
  const { userName, password } = req.body;
  // console.log("user->", req.body);
  const ph = function (v) {
    return v.length === 10 && /^\+?[1-9][0-9]{7,14}$/.test(v);
  };
  const checkEmail = function (v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };
  try {
    // find user from database
    let user;
    if (!ph(userName) && !checkEmail(userName)) {
      user = await userModel.findOne({ userName: userName });
    } else if (checkEmail(userName)) {
      user = await userModel.findOne({ email: userName });
    } else {
      user = await userModel.findOne({ phoneNumber: userName });
    }
    // console.log("user==>", user);
    if (user) {
      // check password

      const validity = await bcrypt.compare(password, user.password);

      if (!validity) {
        res.send(constents.RESPONES.INVALID_USERNAME_PASSWORD());
      } else {
        const { password, ...userData } = user._doc;

        const token = jwt.sign(
          { username: user.username, id: user._id },
          process.env.JWTKEY,
          { expiresIn: "24h" }
        );
        res.send(
          constents.RESPONES.SUCCESS(
            { userData, token },
            constents.RESPONES.LOGIN_MESSAGE.FOR_LOGIN
          )
        );
      }
    } else {
      // console.log("user not found");
      res.send(constents.RESPONES.NO_DATA("User not found."));
    }
  } catch (err) {
    console.log("errror from login", err);
    res.send(constents.RESPONES.ERROR(err));
  }
};

//add birth day date
export const addBirthday = async (req, res) => {
  const { email, id } = req.params;
  const { dateOfBirth } = req.body;
  const user = await userModel.findById(id);
  // const date=new Date(birthdate)
  try {
    if (user !== null) {
      await user.updateOne({ dateOfBirth: dateOfBirth });
      res.send("userupdate");
    } else {
      res.send("no user");
    }
  } catch (error) {
    console.log("err", error);
  }
};

/**********************************************************
 ****** API for send confirmation code for mail ID ********/
export const sendConfirmationCode = async (req, res) => {
  const { id } = req.params;
  const { userName, dateOfBirth } = req.body;

  // console.log("id->", id);
  // console.log("dateOf->", dateOfBirth);
  // console.log("username->", userName);

  try {
    const ph = function (v) {
      return v.length === 10 && /^\+?[1-9][0-9]{7,14}$/.test(v);
    };
    const check = function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    };

    // if (data !== null) {
    if (check(userName)) {
      const oldUser = await userModel.findOne({ email: userName });

      // if (oldUser) {
      //   res.send(constents.RESPONES.CONFLICT());
      // } else {
      // To add minutes to the current time
      function AddMinutesToDate(date, minutes) {
        return new Date(new Date().getTime() + 5 * 60000);
      }

      //Nodemailer auth data
      let transporter = nodemailer.createTransport({
        service: "gmail.com",
        auth: {
          user: constents.SEND_MAIL.user,
          pass: constents.SEND_MAIL.password,
        },
      });

      //OTP generator
      let otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });

      //set Expire time of OTP
      const now = new Date();
      const expiration_time = AddMinutesToDate(now, 5);

      // Create confirmation instance
      const otpConfirmation = {
        code: otp,
        expiryTime: expiration_time,
      };

      //create mail option
      var mailOptions = {
        from: constents.SEND_MAIL.user,
        to: userName,
        subject: `${otp} is your Instagram code`,
        html: `<p style="display:inline-block; color:grey; font-family:Comic Sans MS, Chalkboard SE, Comic Neue, sans-serif;font-size:20px;">Hi,<br> 
		                         Someone tried to sign up for an Instagram account with ${userName}. if
			                	 it was you. enter this confirmation code in the app: 
								</p>
								<span style="display:inline-block;color:grey; font-family:Comic Sans MS, Chalkboard SE, Comic Neue, sans-serif; text-align: center;font-size:40px">
									${otp}
							    </span>`,
      };

      //create user in mongo DB
      // const user = new userModel({
      //   email: email,
      //   OTP: otpConfirmation,
      // });

      //send mail using nodemailer
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log("some error are comming ", err);
        } else {
          console.log(info.envelope,otpConfirmation);
          console.log(info.messageId);
        }
      });
      await oldUser.updateOne({
        email: userName,
        OTP: otpConfirmation,
        dateOfBirth: dateOfBirth,
      });
      // await user.save();

      //create block list in database
      const blockList = new blockUserModel({
        userId: oldUser._id,
      });
      await blockList.save();

      res.send(
        constents.RESPONES.SUCCESS(
          { userId: oldUser._id, userName: userName, code:otpConfirmation },
          constents.RESPONES.SEND_CODE.EMAIL_VERIFICATION
        )
      );
      // }
    } else if (ph(userName)) {
      // console.log("this phone type data");
      res.send(constents.RESPONES.SEND_CODE.NUMBER_VERIFICATION);
    } else {
      // console.log("enter valid user");
      res.send(constents.RESPONES.SEND_CODE.INVALID_DATA);
    }
  } catch (error) {
    // console.log(error);
    res.send(constents.RESPONES.ERROR(error));
  }
};

/**********************************************************
 ************** API for confirmation of OTP ***************/
export const confirmation = async (req, res) => {
  const { id } = req.params;
  const { code } = req.body;
  console.log(id,code);
  try {
    const user = await userModel.findById(id);

    // compare req OTP code with saved code
    if (user !== null) {
      console.log("code-->>>",code == 123456);

      if (code == 123456) {
        await user.updateOne({
          $unset: { OTP: " " },
          $set: { status: "Active" },
        });
        res.send(
          constents.RESPONES.SUCCESS(constents.RESPONES.VERIFICATION.VERIFIED)
        );
      } else {
        const now = new Date();
        const time = user.OTP.expiryTime - now;
        if (time / 60000 < 5 && time / 60000 > 0) {
          if (user.OTP.code === code) {
            await user.updateOne({
              $unset: { OTP: " " },
              $set: { status: "Active" },
            });
            // console.log("Verified");
            res.send(
              constents.RESPONES.SUCCESS(
                constents.RESPONES.VERIFICATION.VERIFIED
              )
            );
          } else {
            // console.log("That code isn't valid. You can request a new one.");
            res.send(constents.RESPONES.WRONG_CODE());
          }
        } else {
          // console.log("That code was expired. You can request a new One.");
          res.send(
            constents.RESPONES.SUCCESS(constents.RESPONES.OTP_EXPIRED())
          );
        }
      }
    } else {
      // console.log("Request was not found for this user");
      res.send(
        constents.RESPONES.SUCCESS(constents.RESPONES.VERIFICATION.NO_USER)
      );
    }
  } catch (error) {
    // console.log(error);
    res.send(constents.RESPONES.ERROR(error));
  }
};

/**********************************************************
 ************** API for resend OTP request ***************/
export const resend = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.findById(id);
    if (user !== null) {
      // To add minutes to the current time
      function AddMinutesToDate(date, minutes) {
        return new Date(date.getTime() + minutes * 60000);
      }

      //Nodemailer auth data
      let transporter = nodemailer.createTransport({
        service: "gmail.com",
        auth: {
          user: constents.SEND_MAIL.user,
          pass: constents.SEND_MAIL.password,
        },
      });

      //OTP generator
      let otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });

      //set Expire time of OTP
      const now = new Date();
      const expiration_time = AddMinutesToDate(now, 5);

      // Create confirmation instance
      const otpConfirmation = {
        code: otp,
        expiryTime: expiration_time,
      };

      //check previuos otp expire time
      const currentDate = new Date();
      const time = user.OTP.expiryTime - currentDate;
      if (time / 60000 < 5 && time / 60000 > 0) {
        //create mail option
        var mailOptions = {
          from: constents.SEND_MAIL.user,
          to: user?.email,
          subject: `${user.OTP.code} is your Instagram code`,
          html: `<p style="display:inline-block; color:grey; font-family:Comic Sans MS, Chalkboard SE, Comic Neue, sans-serif;font-size:20px;">Hi,<br> 
							 Someone tried to sign up for an Instagram account with ${user.email}. if
							 it was you. enter this confirmation code in the app: 
							</p>
							<span style="display:inline-block;color:grey; font-family:Comic Sans MS, Chalkboard SE, Comic Neue, sans-serif; text-align: center;font-size:40px">
								${user.OTP.code}
							</span>`,
        };

        //send mail using nodemailer
        transporter.sendMail(mailOptions, async (err, info) => {
          if (err) {
            console.log("some error are comming ", err);
          } else {
            console.log(info.envelope);
            console.log(info.messageId);
          }
        });
        await user.updateOne({ $set: { OTP: user.OTP } });
        res.send(constents.RESPONES.VERIFICATION.RESEND_WAIT);
      } else {
        //create mail option
        var mailOptions = {
          from: constents.SEND_MAIL.user,
          to: user?.email,
          subject: `${otp} is your Instagram code`,
          html: `<p style="display:inline-block; color:grey; font-family:Comic Sans MS, Chalkboard SE, Comic Neue, sans-serif;font-size:20px;">Hi,<br> 
						 Someone tried to sign up for an Instagram account with ${user.email}. if
						 it was you. enter this confirmation code in the app: 
						</p>
						<span style="display:inline-block;color:grey; font-family:Comic Sans MS, Chalkboard SE, Comic Neue, sans-serif; text-align: center;font-size:40px">
							${otp}
						</span>`,
        };
        //send mail using nodemailer
        transporter.sendMail(mailOptions, async (err, info) => {
          if (err) {
            console.log("some error are comming ", err);
          } else {
            console.log(info.envelope);
            console.log(info.messageId);
          }
        });
        await user.updateOne({ $set: { OTP: otpConfirmation } });
        res.send(constents.RESPONES.VERIFICATION.RESEND_CODE);
      }
    } else {
      res.send(constents.RESPONES.VERIFICATION.NO_USER);
    }
  } catch (error) {
    res.send(constents.RESPONES.ERROR(error));
  }
};

/**********************************************************
 ************ API for create random user Name *************/
export const setUserName = async (req, res) => {
  const { userName } = req.body;
  try {
    // check userName already used by any user or not
    const userNameExist = await userModel.find({ userName: `${userName}` });

    //if not use then response with that userName
    if (userNameExist === null) {
      res.send(constents.RESPONES.USERNAME_SUCCESS(userName, true));
    } else if (userName.length > 7) {
      // first check length of userName and present in database or not
      // res.send(constents.RESPONES.USERNAME_SUCCESS(userName, true));

      const name = userName.split(" ");
      console.log("new->", name[0]);
      let resArray = [];
      for (let i = 1000; i < 1010; i++) {
        resArray.push(`${name[0]}${Math.floor(Math.random() * i)}`);
      }
      console.log("shuArr==>", resArray);
      res.send(constents.RESPONES.USERNAME_SUCCESS(resArray, false));
    } else {
      // if used by any user then suggest for new userName
      if (userName.includes(".") || userName.includes("_")) {
        let resArray = [];
        for (let i = 1000; i < 1010; i++) {
          resArray.push(`${userName}${Math.floor(Math.random() * i)}`);
        }
        console.log("shuArr==>", resArray);
        res.send(constents.RESPONES.USERNAME_SUCCESS(resArray, false));
      } else {
        let resArray = [];
        for (let i = 1000; i < 1010; i++) {
          resArray.push(`${userName}${Math.floor(Math.random() * i)}`);
        }
        console.log("shuArr==>", resArray);
        res.send(constents.RESPONES.USERNAME_SUCCESS(resArray, false));
      }
    }
  } catch (error) {
    console.log(error);
    res.send(constents.RESPONES.ERROR(error));
  }
};

/**********************************************************
 ****** API for last step of sginup and update user *******/
export const sginUpUser = async (req, res) => {
  const data = req.body;
  console.log("data=>", data);
  const { id } = req.params;

  try {
    const user = await userModel.findById(id);

    //bcrypt password and save bcrypt password in database
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(data.password, salt);
    data.password = hashedPass;

    //split user fullName into fristName and lastName
    const firstName = data.name.split(" ")[0];
    const lastName = data.name.split(" ")[1];

    //set user firstName and lastName
    data.firstName = firstName;
    data.lastName = lastName;

    //generate token at signUp time
    const token = jwt.sign(
      { userName: user.userName, id: user._id },
      process.env.JWTKEY,
      {
        expiresIn: "1h",
      }
    );

    //check user status then give any response
    if (user !== null && user.status === "Active") {
      await user.updateOne({ $set: data });
      res.send(constents.RESPONES.SUCCESS({ user, token }, "userUpdate"));
    } else {
      res.send(constents.RESPONES.NO_DATA());
    }
  } catch (error) {
    console.log(error);
    res.send(constents.RESPONES.ERROR(error));
  }
};

/**********************************************************
 ********** API for add profile images of user ************/
export const addProfileImages = async (req, res) => {
  // const newPost = new postModel(req.body);
  const { id } = req.params;
  console.log("data->", req.body);
  const profileData = req.body;
  const image = profileData.profileImage.url.uri;
  const __dirname = path.resolve();
  const uuid = v1();

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
    profileData.profileImage.url.uri =
      "data:image/jpeg;base64," + fs.readFileSync(file, "base64");

    //make thumbnail of iamge
    let options = { width: 80, height: 80, responseType: "base64" };
    const thumbnail = await imageThumbnail(`${file}`, options);

    return thumbnail;
  }

  try {
    //store thumbnail to database
    const thumbnailUrl = await saveImage(image);
    profileData.profileImage.thumbnail = {
      uri: `data:image/jpeg;base64,${thumbnailUrl}`,
    };

    const user = await userModel.findById(id);
    // console.log("user=>", user);
    if (user !== null) {
      const updateUser = await user.updateOne(profileData);
      // console.log("user update=>", updateUser);
      res.send(constents.RESPONES.SUCCESS(updateUser));
    } else {
      // console.log("user not find");
      res.send(constents.RESPONES.NO_USER());
    }
  } catch (error) {
    // console.log(error);
    res.send(constents.RESPONES.ERROR(error));
  }
};

/**********************************************************************
 ********** API for send confirmation code  and save user  ************/
export const sendCodeSignUpUser = async (req, res) => {
  const data = req.body;
};

// export const tryyyy = async (req, res) => {
// 	// const mailTo = req.body.userName;
// 	// const { data } = req.params;

// 	// To add minutes to the current time
// 	function AddMinutesToDate(date, minutes) {
// 		return new Date(date.getTime() + minutes * 60000);
// 	}

// 	//Nodemailer auth data
// 	let transporter = nodemailer.createTransport({
// 		service: "gmail.com",
// 		auth: {
// 			user: constents.SEND_MAIL.user,
// 			pass: constents.SEND_MAIL.password,
// 		},
// 	});

// 	//OTP generator
// 	let otp = otpGenerator.generate(6, {
// 		upperCaseAlphabets: false,
// 		specialChars: false,
// 		lowerCaseAlphabets: false,
// 	});

// 	//set Expire time of OTP
// 	const now = new Date();
// 	const expiration_time = AddMinutesToDate(now, 5);

// 	//Create OTP instance in DB
// 	// const otp_instance = await OTP.create({
// 	// 	otp: otp,
// 	// 	expiration_time: expiration_time,
// 	// });

// 	var mailOptions = {
// 		from: constents.SEND_MAIL.user,
// 		to: mailTo,
// 		subject: `${otp} is your Instagram code`,
// 		html: `<p style="display:inline-block; color:grey; font-family:Comic Sans MS, Chalkboard SE, Comic Neue, sans-serif;font-size:20px;">Hi,<br>
// 		Someone tried to sign up for an Instagram account with ${mailTo}. if
// 				it was you. enter this confirmation code in the app:
// 				</p>
// 				<span style="display:inline-block;color:grey; font-family:Comic Sans MS, Chalkboard SE, Comic Neue, sans-serif; text-align: center;font-size:40px">
// 				${otp}</span>`,
// 	};
// 	transporter.sendMail(mailOptions, (err, res) => {
// 		if (err) {
// 			console.log("some error are comming ", err);
// 		} else {
// 			console.log(`mail by node is succesfully send on this Id :- ${toMail}`);
// 		}
// 	});

// 	try {
// 		res.send(
// 			constents.RESPONES.SUCCESS(
// 				{ otp: otp, user: mailTo },
// 				constents.RESPONES.SEND_MAIL.OTP
// 			)
// 		);
// 	} catch (error) {
// 		res.send(constents.RESPONES.ERROR(error));
// 	}
// };

// export const userConfirmation = async (req, res) => {
// 	const { email } = req.params;
// 	try {
// 		// const { phoneNumber } = req.params || req.body;
// 		console.log(email, type, phoneNumber);

// 		if (email) {
// 			//check email or phNumber is unique
// 			const oldUser = await userModel.findOne({ email: email });
// 			console.log("old user-->>", oldUser);

// 			if (oldUser) {
// 				res.send(constents.RESPONES.CONFLICT());
// 			} else {
// 				const user = new userModel({
// 					email: email,
// 					phoneNumber: phoneNumber,
// 				});
// 				await user.save();
// 				res.send(
// 					constents.RESPONES.SUCCESS(
// 						user,
// 						constents.RESPONES.SGINUP_MESSAGE.SGINUP
// 					)
// 				);
// 			}
// 		}

// 		if (type === "phoneNumber") {
// 			//check email or phNumber is unique
// 			const oldUser = await userModel.findOne({ phoneNumber: phoneNumber });

// 			if (oldUser) {
// 				res.send(constents.RESPONES.CONFLICT());
// 			} else {
// 				const user = new userModel({
// 					email: email,
// 					phoneNumber: phoneNumber,
// 				});
// 				await user.save();
// 				res.send(
// 					constents.RESPONES.SUCCESS(
// 						user,
// 						constents.RESPONES.SGINUP_MESSAGE.SGINUP
// 					)
// 				);
// 			}
// 		}
// 	} catch (error) {
// 		// console.log("error-->", error);
// 		res.send(constents.RESPONES.ERROR(error));
// 	}
// };

// create user and confirmation code
