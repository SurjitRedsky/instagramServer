import path from "path";
import multer from "multer";

const __dirname = path.resolve();

const storage = multer.diskStorage({
	destination: "./upload/image",
	filename: (req, file, cb) => {
		return cb(
			null,
			`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
			// file.originalname
		);
	},
});

export const upload = multer({
	storage: storage,
	limits: { fileSize: 100000 },
	fileFilter: (req, file, cb) => {
		if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
			cb(null, true);
		} else {
			cb(null, false);
		}
	},
});

export const uploadFile = (req, res) => {
	try {
		console.log("from upload==>", req.files);
		sharp(req.files[0].path)
			.resize(200, 200)
			.toFile(
				"upload/image" + "thumbnails-" + req.files[0].originalname,
				(err, resize) => {
					if (err) {
						console.log("error from upload", err);
					} else {
						console.log(resize);
					}
				}
			);
		return res.send({
			message: "Successfully uploaded files",
			image_url: `${process.env.BASE_URL} /view/${req.files[0].filename}`,
		});
	} catch (err) {
		console.log(err);
	}
};

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
	let fileName = Date.now() + "_" + payload.file.originalname;
	let directoryPath = pathToUpload
		? pathToUpload
		: path.resolve(
				__dirname + `../../..${CONFIG.PATH_TO_UPLOAD_SUBMISSIONS_ON_LOCAL}`
		  );
	// create user's directory if not present.
	if (!fs.existsSync(directoryPath)) {
		fs.mkdirSync(directoryPath);
	}
	let fileSavePath = `${directoryPath}/${fileName}`;
	let writeStream = fs.createWriteStream(fileSavePath);
	return new Promise((resolve, reject) => {
		writeStream.write(payload.file.buffer);
		writeStream.on("error", function (err) {
			reject(err);
		});
		writeStream.end(function (err) {
			if (err) {
				reject(err);
			} else {
				let fileUrl = pathToUpload
					? `${CONFIG.SERVER_URL}${pathOnServer}/${fileName}`
					: `${CONFIG.SERVER_URL}${CONFIG.PATH_TO_UPLOAD_SUBMISSIONS_ON_LOCAL}/${fileName}`;
				resolve(fileUrl);
			}
		});
	});
};
