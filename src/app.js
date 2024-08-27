import express from 'express';
import routerApp from './routes/index.js'
import { __dirname } from './util.js';
// import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
// import { productsSocket } from './server/productsServer.js';
// import productManager from './ProductManager.js';
// import fs from 'fs';
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
import { handleErrors } from './middlewares/errors/handleErrors.js';
import { addLogger, logger } from './utils/logger.js';
import methodOverride from 'method-override';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

// const productoManager = new productManager();
// let productos = await productoManager.getProductos();
// const path = 'productos.json'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));

const httpServer = app.listen(envConfig.dbPort, error => {
    logger.info('El servidor funciona');
});
const socketServer = new Server(httpServer);

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
app.use(addLogger);
app.use(routerApp);
app.use((handleErrors()));

// Conectando a base de datos MongoDB Atlas
mongoose.connect(envConfig.dbUrl);
logger.info('base de datos conectada');

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

export const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación de app ecommerce, venta de productos online',
            description: 'API para documentar app de venta de productos online'
        },
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
}

const specs = swaggerJsDoc(swaggerOptions);

app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// WebSocket para el chat y los productos
socketServer.on('connection', async socket => {
    logger.info('Cliente conectado');

    socket.on('producto_actualizado', async producto => {

        let code = producto.code

        const existeProducto = await ProductsService.get({ code });
        
        if (existeProducto) return logger.warning('los productos no pueden compartir el code');

        await ProductsService.create(producto);

        let productos = await ProductsService.getAll();

        socketServer.emit('productos_actualizados', productos);
    });

    socket.on('producto_eliminar', async (idEliminar, email) => {

        console.log(idEliminar);
        console.log(email);

        const productoEncontrado = await ProductsService.get({_id: idEliminar});

        if(productoEncontrado.owner === email) {
            await ProductsService.delete({_id: idEliminar});
        } else if (!email) {
            await ProductsService.delete({_id: idEliminar});
        }

        let productos = await ProductsService.getAll();

        socketServer.emit('productos_eliminados', productos);
    });

    socket.on('mensaje_enviado', async data => {
        // console.log(data);

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