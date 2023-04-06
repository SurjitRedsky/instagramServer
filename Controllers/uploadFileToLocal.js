import path from "path";
import admin from "firebase-admin";
import serviceAccount from "../firebase_keys.js";
import multer from "multer";

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

//upload file on firebase

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // file size this is in MB (5)
  },
});

export const uploadFileOnFirebase = async (req, res) => {
  console.log("starting");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://instagram-clone-378510.appspot.com/",
  });

  const bucket = admin.storage().bucket();

  try {
    const file = req.files.file;
    console.log("fileee", req.files.file);

    if (!file) {
      throw new Error("Please upload a file");
    }

    const filename = `${Date.now()}-${file.name}`;
    const fs = bucket.file(filename);

    const stream = fs.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      predefinedAcl: "publicRead", // Set file access to public-read
    });

    stream.on("error", (error) => {
      console.log(error);
      throw new Error(error);
    });

    stream.on("finish", async () => {
      const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      res.status(200).send({
        message: "File uploaded successfully",
        url,
      });
    });

    stream.end(file.buffer);
  } catch (error) {
    res.status(500).send({
      message: "An error occurred while uploading the file",
      error: error.message,
    });
    console.log(error);
  }
};
