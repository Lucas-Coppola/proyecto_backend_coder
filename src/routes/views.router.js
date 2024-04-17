import { Router } from "express";
import productManager from '../ProductManager.js';

const productoManager = new productManager();
const productos = await productoManager.getProductos();

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