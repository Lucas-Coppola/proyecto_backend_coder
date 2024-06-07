import { Router } from "express";
import { usersModel } from "../Dao/models/mongoDB.models.js";
import { createHash, isValidPassword } from "../utils/bcrypt.js";
import passport from "passport";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/github', passport.authenticate('github', {scope: [ 'user:email' ]}));

router.get('/githubcallback', passport.authenticate('github', {failureRedirect: '/login'}), (req, res) => {
    req.session.user = req.user
    res.redirect('http://localhost:8080/products');
});

router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/failregister' }), async (req, res) => {
    res.redirect('http://localhost:8080/products');
});
router.get('/failregister', (req, res) => {
    console.log('Registro fallido');
    res.send({ error: 'Registro fallido' });
});

router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/faillogin' }), async (req, res) => {

    if (!req.user) return res.status(400).send({ status: 'error', error: 'Credenciales invalidas' });

    console.log(req.user);

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email
    }

    return res.redirect('http://localhost:8080/products');
});
router.get('/faillogin', (req, res) => {
    res.status(401).send({status: 'error', error: 'Login fallido' });
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.send({ status: 'error', error: err });
        else return res.redirect('http://localhost:8080/login');
    });
});

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