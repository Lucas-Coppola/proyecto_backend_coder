import { Router } from "express";
import productManager from '../ProductManager.js';
import { cartsModel, productsModel } from "../Dao/models/mongoDB.models.js";
// import { productsSocket } from "../server/productsServer.js";
// import { socketServer } from "../app.js";
// import { productSocket } from "../app.js";

const productoManager = new productManager();
let productos = await productoManager.getProductos();

const router = Router();

router.get('/', (req, res) => {
    res.render('home', { productos });
});

router.get('/chat', (req, res) => {
    res.render('chat', {});
});

router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', {});
});

router.get('/products', async (req, res) => {
    try {
        const { numPage = 1, limit = 10, sort } = req.query

        let queryOptions = { limit, page: numPage, lean: true };
        if (sort) {
            queryOptions.sort = { precio: parseInt(sort) };
        }

        const {docs, page, hasNextPage, hasPrevPage, nextPage, prevPage} = await productsModel.paginate({}, queryOptions);

        res.render('products', {
            productos: docs,
            page,
            hasNextPage,
            hasPrevPage,
            nextPage,
            prevPage,
            queryOptions
        });

    } catch (error) {
        console.log(error);
    }
});

router.get('/cart/:cid', async (req, res) => {
    const id = req.params.cid;
    const carritoEncontrado = await cartsModel.findOne({_id: id});

    const productosCarrito = carritoEncontrado.products

    console.log(productosCarrito);

    res.render('cart', { productosCarrito, id });
});

export default router