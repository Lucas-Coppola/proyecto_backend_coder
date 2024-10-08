import mongoose from 'mongoose';
import { productsModel, ticketsModel } from '../Dao/models/mongoDB.models.js';
import { CartsService, ProductsService } from '../service/index.js';
import { cantidadSuperaStock, notFoundCart, notFoundProduct, sameOwner, stockAgotado } from '../service/errors/info.js';
import { Error } from '../service/errors/enums.js';
import { CustomError } from '../service/errors/CustomError.js';

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
        try {

            const nuevoCarrito = await this.cartService.create(req.body);

            res.status(200).send({ status: 'success', payload: nuevoCarrito });

        } catch (error) {
            req.logger.error(error);
        }
    }

    getCart = async (req, res, next) => {
        try {

            const id = req.params.cid;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                req.logger.warning('El carrito no fue encontrado');

                CustomError.createError({
                    name: 'Error al encontrar carrito',
                    cause: notFoundCart(id),
                    message: 'El carrito no fue encontrado',
                    code: Error.DATABASE_ERROR
                });
            }

            const carritoEncontrado = await this.cartService.get({ _id: id });


            if (!carritoEncontrado) {
                req.logger.warning('El carrito no fue encontrado');

                CustomError.createError({
                    name: 'Error al encontrar carrito',
                    cause: notFoundCart(id),
                    message: 'El carrito no fue encontrado',
                    code: Error.DATABASE_ERROR
                });
            }

            res.send(carritoEncontrado);

        } catch (error) {
            req.logger.error(error);
            next(error);
        }
    }

    addProductToCart = async (req, res, next) => {
        try {

            const id = req.params.cid;
            const pid = req.params.pid;

            if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(pid)) {
                req.logger.warning('El carrito no fue encontrado');

                if (!mongoose.Types.ObjectId.isValid(id)) {
                    CustomError.createError({
                        name: 'Error al encontrar carrito',
                        cause: notFoundCart(id),
                        message: 'El carrito no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                } else {
                    CustomError.createError({
                        name: 'Error al encontrar producto',
                        cause: notFoundProduct(pid),
                        message: 'El producto no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                }
            }

            const carritoEncontrado = await this.cartService.get({ _id: id });
            const productoEncontrado = await this.productService.get({ _id: pid });

            if (!carritoEncontrado || !productoEncontrado) {
                if (!carritoEncontrado) {
                    req.logger.warning('El carrito no fue encontrado');

                    CustomError.createError({
                        name: 'Error al encontrar carrito',
                        cause: notFoundCart(id),
                        message: 'El carrito no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                } else if (!productoEncontrado) {
                    req.logger.warning('El producto no fue encontrado');

                    CustomError.createError({
                        name: 'Error al encontrar producto',
                        cause: notFoundProduct(pid),
                        message: 'El producto no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                }
            }

            const productoEnCarrito = carritoEncontrado.products.find(item => item.product._id == pid);

            if (productoEnCarrito) {
                if (productoEncontrado.stock > productoEnCarrito.cantidad && productoEncontrado.stock > 0 && productoEncontrado.owner != req.user.email) {
                    productoEnCarrito.cantidad++;
                    carritoEncontrado.markModified('products');
                } else if (productoEncontrado.stock < productoEnCarrito.cantidad && productoEncontrado.stock <= 0) {
                    req.logger.warning('La cantidad que desea supera al stock disponible');

                    CustomError.createError({
                        name: 'Error al agregar producto al carrito',
                        cause: cantidadSuperaStock(),
                        message: 'La cantidad que desea agregar al carrito supera al stock disponible',
                        code: Error.DATABASE_ERROR
                    });
                } else if (productoEncontrado.owner === req.user.email) {
                    req.logger.warning('No puede agregarse al carrito un producto creado por uno mismo');

                    CustomError.createError({
                        name: 'Error al agregar producto al carrito',
                        cause: stockAgotado(productoEncontrado.title),
                        message: 'El producto fue agregado por usted mismo, no puede agregarlo a su carrito',
                        code: Error.DATABASE_ERROR
                    });
                }

            } else {
                if (productoEncontrado.stock > 0 && productoEncontrado.owner != req.user.email) {
                    carritoEncontrado.products.push({ product: productoEncontrado._id, cantidad: 1 });
                } else if (productoEncontrado.stock <= 0) {
                    req.logger.warning('Stock del producto agotado');

                    CustomError.createError({
                        name: 'Error al agregar producto al carrito',
                        cause: stockAgotado(productoEncontrado.title),
                        message: 'Stock agotado',
                        code: Error.DATABASE_ERROR
                    });
                } else if (productoEncontrado.owner === req.user.email) {
                    req.logger.warning('No puede agregarse al carrito un producto creado por uno mismo');

                    CustomError.createError({
                        name: 'Error al agregar producto al carrito',
                        cause: sameOwner(productoEncontrado.title),
                        message: 'El producto fue agregado por usted mismo, no puede agregarlo a su carrito',
                        code: Error.DATABASE_ERROR
                    });
                }
            }

            await carritoEncontrado.save();

            res.send({ status: 'success', payload: `${productoEncontrado.title} agregado al carrito` });

        } catch (error) {
            req.logger.error(error);
            next(error);
        }
    }

    deleteProduct = async (req, res, next) => {
        try {

            const id = req.params.cid;
            const pid = req.params.pid;

            if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(pid)) {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    req.logger.warning('El carrito no fue encontrado');

                    CustomError.createError({
                        name: 'Error al encontrar carrito',
                        cause: notFoundCart(id),
                        message: 'El carrito no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                } else {
                    req.logger.warning('El producto no fue encontrado');

                    CustomError.createError({
                        name: 'Error al encontrar producto',
                        cause: notFoundProduct(pid),
                        message: 'El producto no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                }
            }

            const carritoEncontrado = await this.cartService.get({ _id: id });
            const productoEncontrado = await this.productService.get({ _id: pid });

            if (!carritoEncontrado || !productoEncontrado) {
                if (!carritoEncontrado) {
                    req.logger.warning('El carrito no fue encontrado');

                    CustomError.createError({
                        name: 'Error al encontrar carrito',
                        cause: notFoundCart(id),
                        message: 'El carrito no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                } else if (!productoEncontrado) {
                    req.logger.warning('El producto no fue encontrado');

                    CustomError.createError({
                        name: 'Error al encontrar producto',
                        cause: notFoundProduct(pid),
                        message: 'El producto no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                }
            }

            const productoEnCarrito = carritoEncontrado.products.find(item => item.product._id == pid);

            if (productoEnCarrito.cantidad > 1) {
                productoEnCarrito.cantidad--;
                carritoEncontrado.markModified('products');
                res.send({ status: 'success', payload: `${productoEncontrado}` });
            } else {
                carritoEncontrado.products = carritoEncontrado.products.filter(item => item.product._id != pid);
                res.send({ status: 'success', payload: `${productoEncontrado} eliminado` });
            }

            await carritoEncontrado.save();

        } catch (error) {
            req.logger.error(error);
            next(error);
        }

    }

    deleteCart = async (req, res, next) => {
        try {

            const id = req.params.cid;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                req.logger.warning('El carrito no fue encontrado');

                CustomError.createError({
                    name: 'Error al encontrar carrito',
                    cause: notFoundCart(id),
                    message: 'El carrito no fue encontrado',
                    code: Error.DATABASE_ERROR
                });
            }

            const carritoEncontrado = await this.cartService.get({ _id: id });

            if (!carritoEncontrado) {
                req.logger.warning('El carrito no fue encontrado');

                const error = CustomError.createError({
                    name: 'Error al encontrar carrito',
                    cause: notFoundCart(id),
                    message: 'El carrito no fue encontrado',
                    code: Error.DATABASE_ERROR
                });

                return next(error);
            }

            if (carritoEncontrado.products.length > 0) {
                carritoEncontrado.products = []

                res.send({ status: 'success', payload: `Carrito limpiado` });

                await carritoEncontrado.save();
            } else {
                req.logger.warning('El carrito ya se encuentra vacío');
            }


        } catch (error) {
            req.logger.error(error);
            next(error);
        }
    }

    updateQuantity = async (req, res, next) => {
        try {

            const id = req.params.cid;
            const pid = req.params.pid;

            if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(pid)) {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    req.logger.warning('El carrito no fue encontrado');

                    CustomError.createError({
                        name: 'Error al encontrar carrito',
                        cause: notFoundCart(id),
                        message: 'El carrito no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                } else {
                    req.logger.warning('El producto no fue encontrado');

                    CustomError.createError({
                        name: 'Error al encontrar producto',
                        cause: notFoundProduct(pid),
                        message: 'El producto no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                }
            }

            const { cantidad } = req.body

            const carritoEncontrado = await this.cartService.get({ _id: id });

            if (!carritoEncontrado) {
                req.logger.warning('El carrito no fue encontrado');

                CustomError.createError({
                    name: 'Error al encontrar carrito',
                    cause: notFoundCart(id),
                    message: 'El carrito no fue encontrado',
                    code: Error.DATABASE_ERROR
                });
            }

            const productoEnCarrito = carritoEncontrado.products.find(item => item.product._id == pid);

            if (productoEnCarrito) {
                productoEnCarrito.cantidad = cantidad
                carritoEncontrado.markModified('products');

                await carritoEncontrado.save();

                return res.send({ status: 'success', payload: `Cantidad del ${productoEnCarrito.product.title} actualizada en el carrito` });
            } else if (!productoEnCarrito) {
                req.logger.warning('El producto no fue encontrado en el carrito');

                CustomError.createError({
                    name: 'Error al encontrar producto en carrito',
                    cause: notFoundProduct(pid),
                    message: 'El producto no fue encontrado en el carrito',
                    code: Error.DATABASE_ERROR
                });
            }

        } catch (error) {
            req.logger.error(error);
            next(error);
        }
    }

    updateProductFromCart = async (req, res, next) => {
        try {

            const id = req.params.cid;
            const pid = req.params.pid;

            if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(pid)) {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    req.logger.warning('El carrito no fue encontrado');

                    CustomError.createError({
                        name: 'Error al encontrar carrito',
                        cause: notFoundCart(id),
                        message: 'El carrito no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                } else {
                    req.logger.warning('El producto no fue encontrado');

                    CustomError.createError({
                        name: 'Error al encontrar producto',
                        cause: notFoundProduct(pid),
                        message: 'El producto no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                }
            }

            const { title, descripcion, precio, img, code, stock, category } = req.body

            const carritoEncontrado = await this.cartService.get({ _id: id });

            if (!carritoEncontrado) {
                req.logger.warning('El carrito no fue encontrado');

                CustomError.createError({
                    name: 'Error al encontrar carrito',
                    cause: notFoundCart(id),
                    message: 'El carrito no fue encontrado',
                    code: Error.DATABASE_ERROR
                });
            }

            const productoEnCarrito = carritoEncontrado.products.find(item => item.product._id == pid);

            if (!productoEnCarrito) {
                req.logger.warning('El producto no fue encontrado en el carrito');

                CustomError.createError({
                    name: 'Error al encontrar producto en carrito',
                    cause: notFoundProduct(pid),
                    message: 'El producto no fue encontrado en el carrito',
                    code: Error.DATABASE_ERROR
                });
            }

            if (!title || !descripcion || !precio || !img || !code || !stock || !category) {
                req.logger.warning('Faltan campos necesarios para actualizar producto');

                CustomError.createError({
                    name: 'Error al crear producto',
                    cause: createProductError({ title, descripcion, precio, img, code, stock, category }),
                    message: 'Faltan campos necesarios',
                    code: Error.INVALID_TYPES_ERROR
                });
            } else {
                await this.productService.update({ _id: pid }, { title, descripcion, precio, img, code, stock, category });
            }

            res.status(200).send({ status: 'success', payload: ` ${productoEnCarrito.product.title} actualizado` });

            await carritoEncontrado.save();

        } catch (error) {
            req.logger.error(error);
            next(error);
        }
    }

    purchaseCart = async (req, res, next) => {
        try {

            const id = req.params.cid;

            const user = req.user

            if (id === user.cart) {

                if (!mongoose.Types.ObjectId.isValid(id)) {
                    req.logger.warning('Carrito no encontrado');

                    CustomError.createError({
                        name: 'Error al encontrar carrito',
                        cause: notFoundCart(id),
                        message: 'El carrito no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                }

                const carritoEncontrado = await CartsService.get({ _id: id });

                if (!carritoEncontrado) {
                    req.logger.warning('Carrito no encontrado');

                    CustomError.createError({
                        name: 'Error al encontrar carrito',
                        cause: notFoundCart(id),
                        message: 'El carrito no fue encontrado',
                        code: Error.DATABASE_ERROR
                    });
                }

                if (carritoEncontrado.products.length > 0) {
                    //Logica descuento de stock en base a cantidad comprada
                    const productosCarrito = carritoEncontrado.products.map(p => ({
                        id: p.product._id,
                        cantidad: p.cantidad
                    }));

                    req.logger.info(JSON.stringify(productosCarrito, null, 2));

                    productosCarrito.forEach(async p => {
                        const productoComprado = await ProductsService.get({ _id: p.id });

                        req.logger.info(JSON.stringify(productoComprado, null, 2));

                        if (!productoComprado) {
                            req.logger.warning('El producto no fue encontrado en el carrito');

                            CustomError.createError({
                                name: 'Error al encontrar producto en carrito',
                                cause: notFoundProduct(p.id),
                                message: 'El producto no fue encontrado en el carrito',
                                code: Error.DATABASE_ERROR
                            });
                        }

                        if (productoComprado.stock >= p.cantidad) productoComprado.stock -= p.cantidad

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

                    carritoEncontrado.products = [];

                    await carritoEncontrado.save();

                    return res.status(200).send({ status: 'success', payload: ticket });

                } else return res.send('Carrito vacío, no puede realizarse ninguna compra');

            } else return res.send('El id de su carrito no coincide con el seleccionado');

        } catch (error) {
            req.logger.error(`Error: ${error}`);
            next(error);
        }
    }
}

export default CartsController