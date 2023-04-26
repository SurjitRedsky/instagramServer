import express from "express";
import {uploadFileGetLink, uploadFileToLocal } from "../Controllers/UploadController.js";
import { uploadFileOnFirebase} from "../Controllers/uploadFileToLocal.js";

const router = express.Router();
// router.post("/",upload.single('file') ,uploadFile);
// router.post('/',uploadFileToLocal)
router.post("/",uploadFileGetLink)


router.post('/videos' ,uploadFileOnFirebase);
// router.post("/anyFile", uplo);



export default router;
