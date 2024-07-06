import express from 'express';
import routerApp from './routes/index.js'
import { __dirname } from './util.js';
// import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
// import { productsSocket } from './server/productsServer.js';
import productManager from './ProductManager.js';
import fs from 'fs';
import mongoose from 'mongoose'
import { messagesModel } from './Dao/models/mongoDB.models.js';
import exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { initPassport } from './config/passport.config.js';
import { envConfig } from './config/config.js';
import { ProductsService } from './service/index.js';

const productoManager = new productManager();
let productos = await productoManager.getProductos();
const path = 'productos.json'

const app = express();

const httpServer = app.listen(envConfig.dbPort, error => {
    console.log('El servidor funciona');
});
const socketServer = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

//session y cookies
app.use(cookieParser());
app.use(session({
    store: MongoStore.create({
        mongoUrl: envConfig.dbUrl,
        mongoOptions: {
            // useNewUrlParser: true,
            // useUnifiedTopology: true
        },
        ttl: 60 * 60 * 1000 * 24
    }),
    secret: envConfig.dbSecretSession,
    resave: true,
    saveUninitialized: true
}));
initPassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(routerApp);

// Conectando a base de datos MongoDB Atlas
mongoose.connect(envConfig.dbUrl);
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

// WebSocket para el chat y los productos
socketServer.on('connection', async socket => {
    console.log('Cliente conectado');

    socket.on('producto_actualizado', async producto => {

        // const code = producto.code
        // const existeProducto = productos.some(producto => producto.code === code);

        // if (existeProducto) return console.log('los productos no pueden compartir el code');

        // producto.id = productos.length + 1;
        // productos.push(producto);
        // await fs.promises.writeFile(path, JSON.stringify(productos, null, '\t'), 'utf-8');

        // socketServer.emit('productos_actualizados', productos);
       
        // console.log(producto.code);
        
        // console.log(existeProducto);

        let code = producto.code

        const existeProducto = await ProductsService.get({ code });
        
        if (existeProducto) return console.log('los productos no pueden compartir el code');

        await ProductsService.create(producto);

        let productos = await ProductsService.getAll();

        socketServer.emit('productos_actualizados', productos);
    });

    socket.on('producto_eliminar', async data => {
        // console.log(data);
        // const productoEliminar = productos.filter(p => p.id != data);

        // productos = productoEliminar
        // console.log(productos);

        // await fs.promises.writeFile(path, JSON.stringify(productos, null, '\t'), 'utf-8');

        // socketServer.emit('productos_eliminados', productos);

        // const productoEliminar = productos.filter(p => p.id != data);
        
        // productos = productoEliminar
        // console.log(productos);

        console.log(data);

        await ProductsService.delete({_id: data});

        let productos = await ProductsService.getAll();

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