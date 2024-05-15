import { Router } from 'express';
import { cartsModel } from '../Dao/models/mongoDB.models.js';
import { productsModel } from '../Dao/models/mongoDB.models.js';

const router = Router();

router.get('/', async (req, res) => {
    const carritos = await cartsModel.find({});

    res.send(carritos);
});

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
    const productoEnCarrito = carritoEncontrado.products.find(item => item.product._id == pid);

    if(productoEnCarrito) {
        // console.log(productoEnCarrito);
        productoEnCarrito.cantidad++;
        carritoEncontrado.markModified('products');
    } else {
        carritoEncontrado.products.push({product: productoEncontrado.id, cantidad: 1});
    }

    if(!carritoEncontrado && !productoEncontrado && !productoEnCarrito) return res.send('Carrito o producto inexistente');

    await carritoEncontrado.save();
    
    res.send({status: 'success', payload: `${productoEncontrado} agregado al carrito`});
});

router.delete('/:cid/product/:pid', async (req, res) => {
    const id = req.params.cid;
    const pid = req.params.pid;

    const carritoEncontrado = await cartsModel.findOne({_id: id});
    const productoEncontrado = await productsModel.findOne({ _id: pid });
    const productoEnCarrito = carritoEncontrado.products.find(item => item.product._id == pid);

    if(productoEnCarrito.cantidad > 1) {
        productoEnCarrito.cantidad--;
        carritoEncontrado.markModified('products');
        res.send({status: 'success', payload: `${productoEncontrado}`});
    } else {
        carritoEncontrado.products = carritoEncontrado.products.filter(item => item.product._id != pid);
        res.send({status: 'success', payload: `${productoEncontrado} eliminado`});
    }

    if(!carritoEncontrado && !productoEncontrado && !productoEnCarrito) return res.send('Carrito o producto inexistente');

    await carritoEncontrado.save();
});

router.delete('/:cid', async (req, res) => {
    try {

        const id = req.params.cid;

        const carritoEncontrado = await cartsModel.findOne({_id: id});
    
        if(!carritoEncontrado) return res.send({status: error, payload: 'Carrito inexistente' });
    
        carritoEncontrado.products=[]
    
        res.send({status: 'success', payload: `Carrito limpiado`});

        await carritoEncontrado.save();
        
    } catch (error) {
        return res.send({status: error, payload: 'Carrito inexistente' });
    }
});

router.put('/:cid/product/:pid', async (req, res) => {
    try {

        const id = req.params.cid;
        const pid = req.params.pid;
        const { cantidad } = req.body
    
        const carritoEncontrado = await cartsModel.findOne({_id: id});
        const productoEncontrado = await productsModel.findOne({ _id: pid });
        const productoEnCarrito = carritoEncontrado.products.find(item => item.product._id == pid);
    
        productoEnCarrito.cantidad = cantidad
        carritoEncontrado.markModified('products');
    
        await carritoEncontrado.save();
    
        return res.send({ status: 'success', payload: `Cantidad del ${productoEnCarrito.product.title} actualizada en el carrito` });

    } catch (error) {
        return res.send({ status: 'error', error: `No se encuentra el carrito o producto inexistente dentro del carrito` });
    }
});

router.put('/:cid/updateProduct/:pid', async (req, res) => {
    try {

        const id = req.params.cid;
        const pid = req.params.pid;
    
        const { title, descripcion, precio, img, code, stock, category } = req.body
        const body = req.body
    
        const carritoEncontrado = await cartsModel.findOne({_id: id});
        const productoEnCarrito = carritoEncontrado.products.find(item => item.product._id == pid);
    
        if (!title || !descripcion || !precio || !img || !code || !stock || !category) {
            console.log('Por favor, complete todos los campos para actualizar');
            return res.send({ status: 'error', error: 'faltan campos' });
        } else {
            const productoEncontrado = await productsModel.updateOne({_id: pid}, {title, descripcion, precio, img, code, stock, category});
        }
    
        res.status(200).send({ status: 'success', payload: ` ${productoEnCarrito.product.title} actualizado` });
    
        await carritoEncontrado.save();

    } catch (error) {
        
        return res.send({ status: 'error', error: `No se encuentra el carrito o producto inexistente dentro del carrito` });
    }
});

export default router