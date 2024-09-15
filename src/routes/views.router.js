import { Router } from "express";
import productManager from '../ProductManager.js';
import { cartsModel, productsModel, usersModel } from "../Dao/models/mongoDB.models.js";
import { auth, authUser, createProductAuth } from "../middlewares/auth.middleware.js";
import { UsersService } from "../service/index.js";

const productoManager = new productManager();
let productos = await productoManager.getProductos();

const router = Router();

router.get('/', (req, res) => {
    res.render('home', { productos });
});

router.get('/chat', authUser, (req, res) => {
    res.render('chat', {});
});

router.get('/realtimeproducts', createProductAuth, (req, res) => {

    const email = req.user.email
    const role = req.user.role
    if (role === 'premium') {
        return res.render('realTimeProducts', { email, role });
    } else return res.render('realTimeProducts');

});

router.get('/products', async (req, res) => {
    try {
        const { numPage = 1, limit = 10, sort } = req.query

        let queryOptions = { limit, page: numPage, lean: true };
        if (sort) {
            queryOptions.sort = { precio: parseInt(sort) };
        }

        const { docs, page, hasNextPage, hasPrevPage, nextPage, prevPage } = await productsModel.paginate({}, queryOptions);

        if (req.user) {

            const user = req.user.email

            let usuarioEncontrado = await usersModel.findOne({ email: user });

            if (user === 'adminCoder@coder.com') {
                usuarioEncontrado = {
                    user,
                    first_name: 'Admin Coder',
                    role: 'admin',
                }
            }

            res.render('products', {
                productos: docs,
                page,
                hasNextPage,
                hasPrevPage,
                nextPage,
                prevPage,
                queryOptions,
                usuarioEncontrado
            });

        } else {

            res.render('products', {
                productos: docs,
                page,
                hasNextPage,
                hasPrevPage,
                nextPage,
                prevPage,
                queryOptions
            });
        }

    } catch (error) {
        req.logger.error(error);
    }
});

router.get('/cart/:cid', async (req, res) => {
    const id = req.params.cid;
    const carritoEncontrado = await cartsModel.findOne({ _id: id });

    const productosCarrito = carritoEncontrado.products

    req.logger.info(productosCarrito);

    res.render('cart', { productosCarrito, id });
});

router.get('/register', (req, res) => {
    if (req.user) res.send('Usted ya esta logueado, cierre sesión y vuelva a intentar.');
    else res.render('register');
});

router.get('/login', (req, res) => {
    if (req.user) res.send('Usted ya esta logueado, cierre sesión y vuelva a intentar.');
    else res.render('login');
});

router.get('/perfil', async (req, res) => {

    if (req.user) {

        let usuarioEncontrado = await usersModel.findOne({ email: req.user.email });

        if (req.user.email === 'adminCoder@coder.com') {

            const email = req.user.email

            usuarioEncontrado = {
                email,
                first_name: 'Admin Coder',
                last_name: 'Backend',
                role: 'admin',
                cart: '66415384d58d0d8b7e91820a',
                age: null
            }

            res.render('perfil', { usuarioEncontrado });

        } else {

            if (usuarioEncontrado.age !== null) {

                let fecha = usuarioEncontrado.age

                function calcularEdad(fecha) {
                    var hoy = new Date();
                    var cumpleanos = new Date(fecha);
                    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
                    var m = hoy.getMonth() - cumpleanos.getMonth();

                    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
                        edad--;
                    }

                    return edad;
                }

                let edad = calcularEdad(fecha);

                res.render('perfil', { usuarioEncontrado, edad });

            } else return res.render('perfil', { usuarioEncontrado });
        }
    }
    else res.send('Usted no puede acceder a su perfil sin estar logueado.');
});

router.get('/recoverByEmail', (req, res) => {
    res.render('emailRecover');
});

router.get('/passwordReset/:token', async (req, res) => {
    const { token } = req.params;

    const user = await UsersService.findByRecoveryToken(token);
    if (!user) {
        return res.redirect('http://localhost:8080/recoverByEmail');
    }

    res.render('passwordReset', { token });
});

router.get('/uploadDocuments', (req, res) => {
    if(req.user) {
        res.render('uploads');
    } else {
        res.status(400).send('Debe estar logueado para poder subir archivos');
    }
});

export default router