import { Router } from 'express';
import { productsModel } from '../Dao/models/mongoDB.models.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { numPage = 1, limit = 10, sort, category} = req.query;

        let queryOptions = { limit, page: numPage, lean: true };
        if (sort) {
            queryOptions.sort = { precio: parseInt(sort) };
        }

        const { docs, page, hasNextPage, hasPrevPage, nextPage, prevPage, totalPages } = await productsModel.paginate({}, queryOptions);

        //Productos con filtro category
        const productosCategory = docs.filter(p => p.category === category);

        let responsePayloadCategory = {
            productosCategory,
            page,
            hasNextPage,
            hasPrevPage,
            totalPages
        };

        if (hasNextPage) {
            responsePayloadCategory.nextLink = `http://localhost:8080/api/products?numPage=${nextPage}`;
        }

        if (hasPrevPage) {
            responsePayloadCategory.prevLink = `http://localhost:8080/api/products?numPage=${prevPage}`;
        }

        if(category) return res.send({status: 'success', payload: responsePayloadCategory});

        //Productos sin filtro category
        let responsePayload = {
            productos: docs,
            page,
            hasNextPage,
            hasPrevPage,
            totalPages
        };

        if (hasNextPage) {
            responsePayload.nextLink = `http://localhost:8080/api/products?numPage=${nextPage}`;
        }

        if (hasPrevPage) {
            responsePayload.prevLink = `http://localhost:8080/api/products?numPage=${prevPage}`;
        }

        return res.send({
            status: 'success', 
            payload: responsePayload
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error interno del servidor');
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

        if (!title || !descripcion || !precio || !img || !code || !stock || !category) {
            console.log('Por favor, complete todos los campos para actualizar');
            return res.send({ status: 'error', error: 'faltan campos' });
        } else {
            const productoActualizado = await productsModel.updateOne({ _id: id }, { title, descripcion, precio, img, code, stock, category });
            res.status(200).send({ status: 'success', payload: productoActualizado });
        }
        
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