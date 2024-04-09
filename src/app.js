import express from 'express';
import ProductRouter from './routes/products.router.js';
import CartsRouter from './routes/carts.router.js';
import handlebars from 'express-handlebars'

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.engine('handlebars', handlebars.engine());

app.set() //primer argumento, nombre de la carpeta, segundo, direccion
app.set('view engine', 'handlebars')

app.get('/', async (req, res) => {
    res.status(200).send('<h1>Bienvenido a mi ecommerce</h1>');
});

app.use('/api/products', ProductRouter);
app.use('/api/carts', CartsRouter);

app.listen(8080, error => {
    console.log('El servidor funciona');
});