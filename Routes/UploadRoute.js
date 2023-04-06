import express from "express";
import { upload, uploadFile } from "../Controllers/UploadController.js";
import { uploadFileOnFirebase} from "../Controllers/uploadFileToLocal.js";

const router = express.Router();
router.post("/", upload.any("image"), uploadFile);
router.post('/videos' ,uploadFileOnFirebase);
// router.post("/anyFile", uplo);



export default router;
