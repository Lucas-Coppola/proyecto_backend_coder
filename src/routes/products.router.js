import { Router } from 'express';
import { productsModel } from '../Dao/models/mongoDB.models.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { limit } = req.query

        const productos = await productsModel.find({});

        const productosLimitados = productos.slice(0, limit);

        if (!limit || limit >= productos.length) return res.send(productos);

        res.send(productosLimitados);
    } catch (error) {
        console.log(error);
    }
});

router.get('/:pid', async (req, res) => {
    const id = req.params.pid;

    const productosFiltradosId = await productsModel.findOne({ _id: id });

    res.send(productosFiltradosId);
});

router.post('/', async (req, res) => {
    try {
        const { title, descripcion, precio, img, code, stock, category } = req.body

        const existeProducto = await productsModel.findOne({code});

        if (!title || !descripcion || !precio || !img || !code || !stock || !category) {
            console.log('Por favor, complete todos los campos para agregar producto');
            return res.send({ status: 'error', error: 'faltan campos' });
        }
        else if (existeProducto) {
            console.log('Los productos no pueden compartir el code');
            return res.send({ status: 'error', error: 'los productos no pueden compartir el code' });
        }

        const productoAgregado = await productsModel.create(req.body);
        
        res.status(200).send({ status: 'success', payload: productoAgregado });

    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error interno del servidor.' });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const id = req.params.pid;
        const { title, descripcion, precio, img, code, stock, category } = req.body

        const productoActualizado = await productsModel.updateOne({ _id: id }, { title, descripcion, precio, img, code, stock, category });

        if (!title || !descripcion || !precio || !img || !code || !stock || !category) {
            console.log('Por favor, complete todos los campos para actualizar');
            return res.send({ status: 'error', error: 'faltan campos' });
        }

        res.status(200).send({ status: 'success', payload: productoActualizado });

    } catch (error) {
        console.log(error);
        return res.send({ status: 'error', error: 'Not found' });
    }
});

router.delete('/:pid', async (req, res) => {
    const id = req.params.pid;

    const productoEliminado = await productsModel.deleteOne({ _id: id })

    res.status(200).send({ status: 'success', payload: productoEliminado });
});

export default router