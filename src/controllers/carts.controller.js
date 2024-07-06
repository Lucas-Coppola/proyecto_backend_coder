// import { cartsModel } from '../Dao/models/mongoDB.models.js';
// import { productsModel } from '../Dao/models/mongoDB.models.js';
import { productsModel, ticketsModel } from '../Dao/models/mongoDB.models.js';
import { CartsService, ProductsService } from '../service/index.js';

class CartsController {
    constructor() {
        this.cartService = CartsService;
        this.productService = ProductsService;
    }

    getCarts = async (req, res) => {
        const carritos = await this.cartService.getAll();

        res.send(carritos);
    }

    createCart = async (req, res) => {

        const nuevoCarrito = await this.cartService.create(req.body);

        res.status(200).send({ status: 'success', payload: nuevoCarrito });
    }

    getCart = async (req, res) => {
        const id = req.params.cid;
        const carritoEncontrado = await this.cartService.get({ _id: id });

        res.send(carritoEncontrado);
    }

    addProductToCart = async (req, res) => {
        const id = req.params.cid;
        const pid = req.params.pid;

        const carritoEncontrado = await this.cartService.get({ _id: id });
        const productoEncontrado = await this.productService.get({ _id: pid });
        const productoEnCarrito = carritoEncontrado.products.find(item => item.product._id == pid);

        console.log(productoEncontrado);
        console.log(productoEncontrado);

        if (productoEnCarrito) {
            // console.log(productoEnCarrito);

            if (productoEncontrado.stock > productoEnCarrito.cantidad && productoEncontrado.stock > 0) {
                productoEnCarrito.cantidad++;
                carritoEncontrado.markModified('products');
            } else return res.status(400).json({ error: 'La cantidad que desea supera al stock del producto' });

        } else {
            if(productoEncontrado.stock > 0) {
                carritoEncontrado.products.push({ product: productoEncontrado._id, cantidad: 1 });
            } else {
                return res.status(400).json({ error: 'El stock se encuentra agotado' });
            }
        }

        if (!carritoEncontrado && !productoEncontrado && !productoEnCarrito) return res.send('Carrito o producto inexistente');

        await carritoEncontrado.save();

        res.send({ status: 'success', payload: `${productoEncontrado.title} agregado al carrito` });
    }

    deleteProduct = async (req, res) => {
        const id = req.params.cid;
        const pid = req.params.pid;

        const carritoEncontrado = await this.cartService.get({ _id: id });
        const productoEncontrado = await this.productService.get({ _id: pid });
        const productoEnCarrito = carritoEncontrado.products.find(item => item.product._id == pid);

        if (productoEnCarrito.cantidad > 1) {
            productoEnCarrito.cantidad--;
            carritoEncontrado.markModified('products');
            res.send({ status: 'success', payload: `${productoEncontrado}` });
        } else {
            carritoEncontrado.products = carritoEncontrado.products.filter(item => item.product._id != pid);
            res.send({ status: 'success', payload: `${productoEncontrado} eliminado` });
        }

        if (!carritoEncontrado && !productoEncontrado && !productoEnCarrito) return res.send('Carrito o producto inexistente');

        await carritoEncontrado.save();
    }

    deleteCart = async (req, res) => {
        try {

            const id = req.params.cid;

            const carritoEncontrado = await this.cartService.get({ _id: id });

            if (!carritoEncontrado) return res.send({ status: error, payload: 'Carrito inexistente' });

            carritoEncontrado.products = []

            res.send({ status: 'success', payload: `Carrito limpiado` });

            await carritoEncontrado.save();

        } catch (error) {
            return res.send({ status: error, payload: 'Carrito inexistente' });
        }
    }

    updateQuantity = async (req, res) => {
        try {

            const id = req.params.cid;
            const pid = req.params.pid;
            const { cantidad } = req.body

            const carritoEncontrado = await this.cartService.get({ _id: id });
            const productoEncontrado = await this.productService.get({ _id: pid });
            const productoEnCarrito = carritoEncontrado.products.find(item => item.product._id == pid);

            productoEnCarrito.cantidad = cantidad
            carritoEncontrado.markModified('products');

            await carritoEncontrado.save();

            return res.send({ status: 'success', payload: `Cantidad del ${productoEnCarrito.product.title} actualizada en el carrito` });

        } catch (error) {
            return res.send({ status: 'error', error: `No se encuentra el carrito o producto inexistente dentro del carrito` });
        }
    }

    updateProductFromCart = async (req, res) => {
        try {

            const id = req.params.cid;
            const pid = req.params.pid;

            const { title, descripcion, precio, img, code, stock, category } = req.body
            const body = req.body

            const carritoEncontrado = await this.cartService.get({ _id: id });
            const productoEnCarrito = carritoEncontrado.products.find(item => item.product._id == pid);

            if (!title || !descripcion || !precio || !img || !code || !stock || !category) {
                console.log('Por favor, complete todos los campos para actualizar');
                return res.send({ status: 'error', error: 'faltan campos' });
            } else {
                const productoEncontrado = await this.productService.update({ _id: pid }, { title, descripcion, precio, img, code, stock, category });
            }

            res.status(200).send({ status: 'success', payload: ` ${productoEnCarrito.product.title} actualizado` });

            await carritoEncontrado.save();

        } catch (error) {
            return res.send({ status: 'error', error: `No se encuentra el carrito o producto inexistente dentro del carrito` });
        }
    }

    purchaseCart = async (req, res) => {
        try {

            const id = req.params.cid;

            const carritoEncontrado = await CartsService.get({ _id: id });

            console.log(carritoEncontrado.products);

            if (carritoEncontrado.products != []) {

                //Logica descuento de stock en base a cantidad comprada
                const productosCarrito = carritoEncontrado.products.map(p => ({
                    id: p.product._id,
                    cantidad: p.cantidad
                }));

                console.log(productosCarrito);

                productosCarrito.forEach(async p => {
                    const productoComprado = await ProductsService.get({ _id: p.id });
                    console.log(productoComprado);

                    if (!productoComprado) console.log(`Producto con ID ${producto.id} no encontrado en su carrito`);

                    if (productoComprado.stock >= p.cantidad) productoComprado.stock -= p.cantidad

                    console.log(productoComprado.stock);

                    await ProductsService.update(p.id, { stock: productoComprado.stock });
                });

                //Logica creacion del ticket, precio, cantidad, create at, etc
                const prices = carritoEncontrado.products.map(p => p.product.precio);

                const amount = prices.reduce((cantidad, price) => cantidad + price, 0);

                const timestamp = Date.now();

                const fecha = new Date(timestamp);

                const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                const options = {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    userTimeZone
                };

                const fechaFormateada = fecha.toLocaleString('es-AR', options);

                const nuevoTicket = {
                    purchase_datetime: fechaFormateada,
                    amount,
                    purchaser: req.user.email
                }

                const ticket = await ticketsModel.create(nuevoTicket);

                // console.log(carritoEncontrado.products);

                carritoEncontrado.products = [];

                await carritoEncontrado.save();

                return res.status(200).send({ status: 'success', payload: ticket });

            } else return res.send('Carrito vacío, no puede realizarse ninguna compra');

        } catch (error) {
            console.log(error);
            return res.send({ status: 'error', error: `No se ha podido realizar la compra` });
        }
    }
}

export default CartsController

// const result = await Swal.fire({
//     icon: 'question',
//     title: 'Confirmar compra',
//     text: `¿Está seguro que desea realizar la compra?`,
//     showCancelButton: true,
//     confirmButtonText: 'Confirmar',
//     cancelButtonText: 'Cancelar'
// }).then( async (result) => {
//     if (result.isConfirmed) {
//         const ticket = await ticketsModel.create(nuevoTicket);

//         carritoEncontrado.products = [];

//         await carritoEncontrado.save();

//         return res.status(200).send({ status: 'success', payload: ticket });
//     } else return res.status(200).send('Compra cancelada por el usuario');
// });