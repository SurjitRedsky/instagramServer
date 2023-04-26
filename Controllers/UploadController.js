import path from "path";
import multer from "multer";
import * as fs from "fs";
import { constents } from "../Constents.js";

const __dirname = path.resolve();

export const uploadFileGetLink = async (req, res) => {
  console.log("file-->", req.body);
  const file = req.files.file;

  try {
    if (file!="null") {
      const fileName = Date.now() + path.extname(file.name);
      // const fileName = Date.now() + "_" + file.name;

      if (file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
        file.mv(`public/uploads/images/${fileName}`, (err) => {
          if (err) {
            console.log("err->>", err);

            res.send(constents.RESPONES.ERROR(err, " Uploading error "));
          }
          res.send(
            constents.RESPONES.SUCCESS(
              { url: `${req.protocol}://${req.get("host")}/${fileName}` },
              "Successfully Genrated a link"
            )
          );
        });
      } else if (file.mimetype == "video/mp4") {
        file.mv(`public/uploads/videos/${fileName}`, (err) => {
          if (err) {
            console.log("err->>", err);

            res.send(constents.RESPONES.ERROR(err, " Uploading error "));
          }
          res.send(
            constents.RESPONES.SUCCESS(
              { url: `${req.protocol}://${req.get("host")}/${fileName}` },
              "Successfully Genrated a link"
            )
          );
        });
      } else {
        file.mv(`public/uploads/files/${fileName}`, (err) => {
          if (err) {
            console.log("err->>", err);
            res.send(constents.RESPONES.ERROR(err, " Uploading error "));
          }
          res.send(
            constents.RESPONES.SUCCESS(
              { url: `${req.protocol}://${req.get("host")}/${fileName}` },
              "Successfully Genrated a link"
            )
          );
        });
      }
    } else {
      res.send("please select file !!!");
    }
  } catch (error) {
    res.send(error);
  }
};

// sharp(req.file.path).resize(200, 200).toFile('uploads/' + 'thumbnails-' + req.file.originalname, (err, resizeImage) => {
// 	if (err) {
// 			console.log(err);
// 	} else {
// 			console.log(resizeImage);
// 	}
// })
// return res.status(201).json({
// 	message: 'File uploded successfully'
// });

// const storage = multer.diskStorage({
// 	destination: "./upload/image",
// 	filename: (req, file, cb) => {
// 		console.log("file->>>>1",file);
// 		return cb(
// 			null,
// 			`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
// 			// file.originalname
// 		);
// 	},
// });

// export const upload = multer({
// 	storage: storage,
// 	limits: { fileSize: 100000 }
// 	// fileFilter: (req, file, cb) => {
// 	// 	console.log("file from form ->",file);
// 	// 	if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
// 	// 		cb(null, true);
// 	// 	} else {
// 	// 		cb(null, false);
// 	// 	}
// 	// },
// })
// multer({ storage: storage }).single("profile");

// export const uploadFile =async (req, res) => {
// 	console.log("from upload==>", req.files.file);
// 	try {

// 		const thumbnailPath=path.join(__dirname,"upload/image","thumbnail", `${req.files.file.name}.${req.files.file.mimetype}`)
// 	await	sharp(req.files.file)
// 			.resize(200, 200)
// 			.toFile(
// 				thumbnailPath
// 				// "upload/image" + "thumbnails-" + req.files.file.name,
// 				// (err, resize) => {
// 				// 	if (err) {
// 				// 		console.log("error from upload", err);
// 				// 	} else {
// 				// 		console.log(resize);
// 				// 	}
// 				// }
// 			);
// 		return res.send({
// 			message: "Successfully uploaded files",
// 			image_url: `${process.env.BASE_URL} /view/${req.files.file.name}`,
// 		});
// 	} catch (err) {
// 		console.log(err);
// 	}
// };

// previous api--- ****************
// export const uploadFile = (req, res) => {
// 	console.log("from upload==>", req.files);
// 	try {
// 		upload(req.files[0].path)
// 			.resize(200, 200)
// 			.toFile(
// 				"upload/image" + "thumbnails-" + req.files[0].originalname,
// 				(err, resize) => {
// 					if (err) {
// 						console.log("error from upload", err);
// 					} else {
// 						console.log(resize);
// 					}
// 				}
// 			);
// 		return res.send({
// 			message: "Successfully uploaded files",
// 			image_url: `${process.env.BASE_URL} /view/${req.files[0].filename}`,
// 		});
// 	} catch (err) {
// 		console.log(err);
// 	}
// };
// ************************

// without multer file upload----------------------------------------------
// export const uploadFile = (req, res) => {
// 	try {
// 		if (req.files === null) {
// 			return res.status(400).json({ msg: "No file uploaded" });
// 		}

// 		const file = req.files.files;
// 		const fileName = file.name;
// 		const extension = path.extname(fileName);

// 		const allowedExtensions = /xml|jpeg|jpg|pdf|png/;

// 		if (!allowedExtensions.test(extension)) throw "Unsupported file type!";

// 		//.mv() = move the file to current dir/public/uploads
// 		file.mv(`${__dirname}/public/uploads/${file.name}`);

// 		res.json({
// 			message: "File uploaded successfully!",
// 			fileName: file.name,
// 			description: req.body,
// 			date: new Date().toISOString().split("T")[0],
// 			filePath: `${process.env.BASE_URL}/uploads/${file.name}`,
// 		});
// 	} catch (err) {
// 		console.error(err);
// 		//500 server error
// 		return res.status(500).send(err);
// 	}
// };

// routes.post("/upload", upload.any("image"), (req, res) => {
// 	try {
// 		sharp(req.files[0].path)
// 			.resize(200, 200)
// 			.toFile(
// 				"upload/image" + "thumbnails-" + req.files[0].originalname,
// 				(err, resize) => {
// 					if (err) {
// 						console.log(err);
// 					} else {
// 						console.log(resize);
// 					}
// 				}
// 			);
// 		return res.send({
// 			message: "Successfully uploaded files",
// 			image_url: `http://localhost:3001/view/${req.files[0].filename}`,
// 		});
// 	} catch (err) {
// 		console.log(err);
// 	}
// });
// module.exports = routes;

// const uploadFileToLocal=()=>{

// }
export const uploadFileToLocal = async (
  payload,
  pathToUpload,
  pathOnServer
) => {
  console.log("paylodad-->", payload.files.file.name);

  let fileName = Date.now() + "_" + payload.files.file.name;
  let directoryPath = pathToUpload
    ? pathToUpload
    : path.resolve(`${__dirname}/upload`);
  // create user's directory if not present.
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(path.join(__dirname, "/upload"), true);
  }
  let fileSavePath = `${directoryPath}/${fileName}`;
  let writeStream = fs.createWriteStream(fileSavePath);
  return new Promise((resolve, reject) => {
    writeStream.write(payload.files.file.buffer);
    writeStream.on("error", function (err) {
      reject(err);
    });
    writeStream.end(function (err) {
      if (err) {
        reject(err);
      } else {
        let fileUrl = pathToUpload
          ? `${process.env.BASE_URL}/upload/${fileName}`
          : `${process.env.BASE_URL}/upload/images/${fileName}`;
        resolve(fileUrl);
      }
    });
  });
};
