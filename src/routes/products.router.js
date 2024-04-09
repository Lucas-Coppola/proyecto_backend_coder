import { Router } from 'express';
import productManager from '../ProductManager.js';
import fs from 'fs'

const path = './productos.json'

const productoManager = new productManager();

const router = Router();

const productos = await productoManager.getProductos();

router.get('/', async (req, res) => {
    try {
        const { limit } = req.query

        if (!limit || limit >= productos.length) return res.send(productos);

        const productosLimitados = productos.filter(p => p.id <= limit);
        res.send(productosLimitados);
    } catch (error) {
        console.log(error);
    }
});

router.get('/:pid', (req, res) => {
    const id = req.params.pid;

    if(id > productos.length || id == 0) return res.send('El producto no existe');

    const productosFiltradosId = productos.find(p => p.id == id); 
    res.send(productosFiltradosId);
});


//duda: cual es el json que modfica
router.post('/', async (req, res) => {
    try {
        const { title, descripcion, precio, img, code, stock, category } = req.body

        const existeProducto = productos.some( producto => producto.code == code );

        if (!title || !descripcion || !precio || !img || !code || !stock || !category) {
            console.log('Por favor, complete todos los campos para agregar producto');
            return res.send({status: 'error', error: 'faltan campos'});
        } else if (existeProducto) {
            console.log('Los productos no pueden compartir el code');
            return res.send({status: 'error', error: 'los productos no pueden compartir el code'});
        }

        const productoAgregado = {
            title,
            descripcion,
            precio, 
            img,
            code,
            id: productos.at(-1).id + 1,
            stock,
            category,
            status: true
        }

        productos.push(productoAgregado);
        console.log(productos);
        await fs.promises.writeFile(path, JSON.stringify(productos, null, '\t'), 'utf-8');

        res.status(200).send({status: 'success', payload: productoAgregado});

    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error interno del servidor.' });
    }
});

router.put('/:pid', async (req, res) => {
    const id = req.params.pid;
    const productoActualizado = req.body

    const productoIndex = productos.findIndex(producto => producto.id == Number(id));

    if( productoIndex === -1 ) return res.send({status: 'error', error: 'el producto no fue encontrado'});

    productos[productoIndex] = { id: Number(id), ...productoActualizado }
    await fs.promises.writeFile(path, JSON.stringify(productos, null, '\t'), 'utf-8');

    res.status(200).send({status: 'success', payload: productoActualizado});
});

router.delete('/:pid', async (req, res) => {
    const id = req.params.pid;

    if(id > productos.length || id == 0) return res.send({status: 'error', error: 'el producto no fue encontrado'})

    const productoEliminado = productos.filter(producto => producto.id !== Number(id));
    await fs.promises.writeFile(path, JSON.stringify(productoEliminado, null, '\t'), 'utf-8');

    res.status(200).send({status: 'success', payload: productoEliminado});
});

export default router