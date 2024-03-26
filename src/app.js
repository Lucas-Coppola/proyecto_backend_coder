const express = require('express');
const productManager = require('./ProductManager');

const app = express();
const productoManager = new productManager();

app.get('/products', async (req, res) => {
    try {
        const { limit } = req.query
        const productos = await productoManager.getProductos();

        if (!limit || limit >= productos.length) return res.send(productos);

        const productosLimitados = productos.filter(p => p.id <= limit);
        res.send(productosLimitados);
    } catch (error) {
        console.log(error);
    }
});

app.get('/products/:pid', async (req, res) => {
    const productos = await productoManager.getProductos();
    const id = req.params.pid;

    if(id > productos.length || id == 0) return res.send('El producto no existe');

    const productosFiltradosId = productos.find(p => p.id == id); 
    res.send(productosFiltradosId);
});

app.listen(8080, error => {
    console.log('El servidor funciona');
});