import { Router } from "express";
// import passport from "passport";
import { auth } from "../../middlewares/auth.middleware.js";
// import SessionController from "../../controllers/sessions.controller.js";
import UsersPremiumController from "../../controllers/usersPremium.controller.js";
import { UsersService } from "../../service/index.js";
import { uploader } from "../../utils/multer.js";

const router = Router();

const { updateUserRole } = new UsersPremiumController();

router.get('/premium/:uid', auth, updateUserRole);

router.post('/uploadFiles', uploader.single('myFile'), async (req, res) => {

    // console.log(req.user);

    const uid = req.user._id;

    const usuarioEncontrado = await UsersService.get({ _id: uid });

    const uploadedFile = {
        name: req.file.originalname,
        reference: req.file.path
    }

    usuarioEncontrado.documents.push(uploadedFile);

    await usuarioEncontrado.save();

    if (!req.file) {
        return res.send('no se puede subir el archivo');
    }

    res.send('archivo subido');
});

export default router