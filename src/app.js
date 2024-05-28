import express from 'express';
import ProductRouter from './routes/products.router.js';
import CartsRouter from './routes/carts.router.js';
import ViewsRouter from './routes/views.router.js';
import SessionsRouter from './routes/sessions.router.js';
import { __dirname } from './util.js';
// import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
// import { productsSocket } from './server/productsServer.js';
import productManager from './ProductManager.js';
import fs from 'fs'
import mongoose from 'mongoose'
import { messagesModel } from './Dao/models/mongoDB.models.js';
import exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { initPassport } from './config/passport.config.js';

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

//session y cookies
app.use(cookieParser());
app.use(session({
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://coppolalucascai:H9kvrbP0SYkvDn0b@codercluster.vmldebb.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=CoderCluster',
        mongoOptions: {
            // useNewUrlParser: true,
            // useUnifiedTopology: true
        },
        ttl: 60 * 60 * 1000 * 24
    }),
    secret: 's3cr3etC@d3r',
    resave: true,
    saveUninitialized: true
}));
initPassport();
app.use(passport.initialize());
app.use(passport.session());

// Conectando a base de datos MongoDB Atlas
mongoose.connect('mongodb+srv://coppolalucascai:H9kvrbP0SYkvDn0b@codercluster.vmldebb.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=CoderCluster');
console.log('base de datos conectada');

// Config Handlebars
const hbs = exphbs.create({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// Routes
app.use('/api/products', ProductRouter);
app.use('/api/carts', CartsRouter);
app.use('/api/sessions', SessionsRouter);
app.use('/', ViewsRouter);

// WebSocket para el chat y los productos
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