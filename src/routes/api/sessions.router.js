import { Router } from "express";
import { usersModel } from "../../Dao/models/mongoDB.models.js";
import { createHash, isValidPassword } from "../../utils/bcrypt.js";
import passport from "passport";
import { auth } from "../../middlewares/auth.middleware.js";
import SessionController from "../../controllers/sessions.controller.js";

const router = Router();

const {
    githubConfig,
    githubLogin,
    createUser,
    getUser,
    userLogout
} = new SessionController();

router.get('/github', githubConfig);

router.get('/githubcallback', passport.authenticate('github', {failureRedirect: '/login'}), githubLogin);

router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/failregister' }), createUser);
router.get('/failregister', (req, res) => {
    console.log('Registro fallido');
    res.send({ error: 'Registro fallido' });
});

router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/faillogin' }), getUser);
router.get('/faillogin', (req, res) => {
    res.status(401).send({status: 'error', error: 'Login fallido' });
});

router.get('/logout', userLogout);

router.get('/current', auth, (req, res) => {
    res.send('Usuario autorizado a datos sensibles');
});

export default router

// router.post('/register', async (req, res) => {
//     try {

//         const { first_name, last_name, email, password } = req.body

//         if(!email || !password) res.send('Por favor complete los datos para poder registrarse');

//         const usuarioExistente = await usersModel.findOne({email: email});
//         if(usuarioExistente) res.status(401).send({status: 'error', error: 'Email existente, selecciona otro para registrarte' });
//         else {

//             const nuevoUsuario = {
//                 first_name,
//                 last_name,
//                 email,
//                 password: createHash(password)
//             }

//             const result = await usersModel.create(nuevoUsuario);

//             res.send('Registrado exitosamente, por favor, loguee para corroborar siguiendo este link: http://localhost:8080/login');

//         }

//     } catch (error) {
//         res.status(401).send({status: error, error: 'Faltan datos o email ya en uso'})
//     }
// });

// router.post('/login', async (req, res) => {
//     try {

//         const { email, password } = req.body

//         if(!email || !password) res.send('Por favor complete los datos para poder registrarse');

//         let usuarioEncontrado = await usersModel.findOne({email});

//         // console.log(usuarioEncontrado);

//         if(email === 'adminCoder@coder.com' && password === 'adminCod3er123') {
//             req.session.user = {
//                 email,
//                 admin: true
//             }

//            return res.redirect('http://localhost:8080/products');
//         }

//         if(!usuarioEncontrado) return res.status(401).send({status: 'error', error: 'usuario no encontrado'});

//         if(!isValidPassword(password, { password: usuarioEncontrado.password })) return res.status(401).send({status: 'error', error: 'Constraseña inválida'});

//         if(usuarioEncontrado) {
//             req.session.user = {
//                 email,
//                 admin: usuarioEncontrado.role === 'admin'
//             }

//            return res.redirect('http://localhost:8080/products');
//         }

//     } catch (error) {
//         console.log(error);
//     }
// });