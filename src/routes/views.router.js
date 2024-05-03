import { Router } from "express";
import productManager from '../ProductManager.js';
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

export default router