import { Router } from "express";
// import passport from "passport";
import { auth } from "../../middlewares/auth.middleware.js";
// import SessionController from "../../controllers/sessions.controller.js";
import UsersPremiumController from "../../controllers/usersPremium.controller.js";
import { UsersService } from "../../service/index.js";
import { uploader } from "../../utils/multer.js";

const router = Router();

const { 
    updateUserRole,
    uploaderUserFiles
} = new UsersPremiumController();

router.get('/premium/:uid', auth, updateUserRole);

router.post('/uploadFiles', uploader.single('myFile'), uploaderUserFiles);

export default router