import { Router } from "express";
// import { usersModel } from "../../Dao/models/mongoDB.models.js";
// import { createHash, isValidPassword } from "../../utils/bcrypt.js";
import passport from "passport";
import { auth } from "../../middlewares/auth.middleware.js";
import SessionController from "../../controllers/sessions.controller.js";
import { ProductsService, UsersService } from "../../service/index.js";
import { UserDtoCurrent } from "../../dtos/users.dto.js";

const router = Router();

const {
    githubConfig,
    githubLogin,
    createUser,
    getUser,
    userLogout,
    userDataAdminAccess
} = new SessionController();

router.get('/github', githubConfig);

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), githubLogin);

router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/failregister' }), createUser);
router.get('/failregister', (req, res) => {
    console.log('Registro fallido');
    res.send({ error: 'Registro fallido' });
});

router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/faillogin' }), getUser);
router.get('/faillogin', (req, res) => {
    res.status(401).send({ status: 'error', error: 'Login fallido' });
});

router.get('/logout', userLogout);

router.get('/current', auth, userDataAdminAccess);

export default router