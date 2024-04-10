import { Router } from 'express';
import productManager from '../ProductManager.js';
import fs from 'fs'

const productoManager = new productManager();
const productos = await productoManager.getProductos();

const router = Router();

const path = './carrito.json'

async function leerArchivo() {
    try {
        const leerProductos = await fs.promises.readFile(path, 'utf-8');
        return JSON.parse(leerProductos);
    } catch (error) {
        return carrito = [];
    }
}

const carrito = await leerArchivo();

router.post('/', async (req, res) => {
    const nuevoCarrito = {
        id: carrito.length + 1,
        products: []
    };

    carrito.push(nuevoCarrito);
    await fs.promises.writeFile(path, JSON.stringify(carrito, null, '\t'), 'utf-8');
    console.log(carrito);

    res.status(200).send({status: 'success', payload: nuevoCarrito});
});

router.get('/:cid', async (req, res) => {
    const id = req.params.cid;

    const carritoEncontrado = carrito.find(carrito => carrito.id == id);

    if(!carritoEncontrado) return res.send('Carrito inexistente');

    res.send(carritoEncontrado);
});

router.post('/:cid/product/:pid', async (req, res) => {
    const id = req.params.cid;
    const pid = req.params.pid;

    const carritoEncontrado = carrito.find(carrito => carrito.id == id);
    const productoEncontrado = productos.find(p => p.id == pid);
    const productoEnCarrito = carritoEncontrado.products.find(item => item.id == pid);

    if(productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carritoEncontrado.products.push({ id: productoEncontrado.id, cantidad: 1});
    }
    await fs.promises.writeFile(path, JSON.stringify(carrito, null, '\t'), 'utf-8');

    res.send({status: 'success', payload: `${productoEncontrado} agregado al carrito`});

    if(!carritoEncontrado || !productoEncontrado || !productoEnCarrito) return res.send('Carrito o producto inexistente');
});

export default router