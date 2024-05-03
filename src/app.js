import express from 'express';
import ProductRouter from './routes/products.router.js';
import CartsRouter from './routes/carts.router.js';
import ViewsRouter from './routes/views.router.js';
import { __dirname } from './util.js';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
// import { productsSocket } from './server/productsServer.js';
import productManager from './ProductManager.js';
import fs from 'fs'
import mongoose from 'mongoose'
import { messagesModel } from './Dao/models/products.models.js';

const productoManager = new productManager();
let productos = await productoManager.getProductos();
const path = 'productos.json'

const app = express();

const httpServer = app.listen(8080, error => {
    console.log('El servidor funciona');
});
const socketServer = new Server(httpServer);

// app.use(productsSocket(socketServer));

// function productSocket(socketServer) {
//     return (req, res, next) => {
//         req.socketServer = socketServer
//         next;
//     };
// };

// app.use(productSocket(socketServer));

// export { productSocket, socketServer };

// export { app, socketServer };

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Conectando a base de datos MongoDB Atlas
mongoose.connect('mongodb+srv://coppolalucascai:H9kvrbP0SYkvDn0b@codercluster.vmldebb.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=CoderCluster');
console.log('base de datos conectada');

// Config Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use('/api/products', ProductRouter);
app.use('/api/carts', CartsRouter);
app.use('/', ViewsRouter);

socketServer.on('connection', async socket => {
    console.log('Cliente conectado');

    socket.on('producto_actualizado', async producto => {

        const code = producto.code
        const existeProducto = productos.some(producto => producto.code === code);

        if (existeProducto) return console.log('los productos no pueden compartir el code');

        producto.id = productos.length + 1;
        productos.push(producto);
        await fs.promises.writeFile(path, JSON.stringify(productos, null, '\t'), 'utf-8');

        socketServer.emit('productos_actualizados', productos);
    });

    socket.on('producto_eliminar', async data => {
        console.log(data);
        const productoEliminar = productos.filter(p => p.id != data);

        productos = productoEliminar
        console.log(productos);

        await fs.promises.writeFile(path, JSON.stringify(productos, null, '\t'), 'utf-8');

        socketServer.emit('productos_eliminados', productos);
    });

    socket.on('mensaje_enviado', async data => {
        console.log(data);

        const messages = await messagesModel.find({});

        const nuevoMensaje = new messagesModel({
            user: data.usuario,
            message: data.mensaje
        });

        await nuevoMensaje.save();

        messages.push(nuevoMensaje);

        socketServer.emit('mensajes_enviados', messages);
    });
});