import { Router } from 'express';
import { cartsModel } from '../Dao/models/products.models.js';
import { productsModel } from '../Dao/models/products.models.js';

const router = Router();

router.post('/', async (req, res) => {
    
    const nuevoCarrito = await cartsModel.create(req.body);

    res.status(200).send({status: 'success', payload: nuevoCarrito});
});

router.get('/:cid', async (req, res) => {
    const id = req.params.cid;
    const carritoEncontrado = await cartsModel.findOne({_id: id});

    res.send(carritoEncontrado);
});

router.post('/:cid/product/:pid', async (req, res) => {
    const id = req.params.cid;
    const pid = req.params.pid;

    const carritoEncontrado = await cartsModel.findOne({_id: id});
    const productoEncontrado = await productsModel.findOne({ _id: pid });
    const productoEnCarrito = carritoEncontrado.products.find(item => item._id == pid);

    if(productoEnCarrito) {
        console.log(productoEnCarrito);
        productoEnCarrito.cantidad++;
        carritoEncontrado.markModified('products');
    } else {
        carritoEncontrado.products.push({_id: productoEncontrado.id, cantidad: 1});
    }

    if(!carritoEncontrado && !productoEncontrado && !productoEnCarrito) return res.send('Carrito o producto inexistente');

    await carritoEncontrado.save();
    
    res.send({status: 'success', payload: `${productoEncontrado} agregado al carrito`});
});

export default router