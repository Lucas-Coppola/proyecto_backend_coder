import mongoose from 'mongoose';
import { productsModel } from '../Dao/models/mongoDB.models.js';
import { CustomError } from '../service/errors/CustomError.js';
import { Error } from '../service/errors/enums.js';
import { codeProductExistente, createProductError, notFoundProduct } from '../service/errors/info.js';
import { ProductsService } from '../service/index.js';
import { generateProduct } from '../utils/generateProductsMock.js';

class ProductController {
    constructor() {
        this.productService = ProductsService
    }

    getProducts = async (req, res) => {
        try {

            const { numPage = 1, limit = 10, sort, category } = req.query;

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

            if (category) return res.send({ status: 'success', payload: responsePayloadCategory });

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
            req.logger.error(error);
            res.status(500).send('Error interno del servidor');
        }
    }

    getFilteredProducts = async (req, res, next) => {
        try {

            const id = req.params.pid;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                req.logger.warning('El producto no fue encontrado');

                CustomError.createError({
                    name: 'Error al encontrar producto',
                    cause: notFoundProduct(id),
                    message: 'El producto no fue encontrado',
                    code: Error.DATABASE_ERROR
                });
            }

            const productoEncontrado = await this.productService.get({ _id: id });

            if (!productoEncontrado) {
                req.logger.warning('El producto no fue encontrado');

                CustomError.createError({
                    name: 'Error al encontrar producto',
                    cause: notFoundProduct(id),
                    message: 'El producto no fue encontrado',
                    code: Error.DATABASE_ERROR
                });
            }

            const productosFiltradosId = await this.productService.get({ _id: productoEncontrado._id });

            return res.send(productosFiltradosId);

        } catch (error) {
            req.logger.error(error);
            next(error);
        }
    }

    createProduct = async (req, res, next) => {
        try {

            const { title, descripcion, precio, img, code, stock, category } = req.body

            const existeProducto = await this.productService.get({ code });

            if (!title || !descripcion || !precio || !img || !code || !stock || !category) {
                req.logger.warning('Faltan campos necesarios para crear producto');

                CustomError.createError({
                    name: 'Error al crear producto',
                    cause: createProductError({ title, descripcion, precio, img, code, stock, category }),
                    message: 'Faltan campos necesarios',
                    code: Error.INVALID_TYPES_ERROR
                });

            } else if (existeProducto) {
                req.logger.warning('Los productos no pueden compartir el code');

                CustomError.createError({
                    name: 'Error al crear producto',
                    cause: codeProductExistente({ code }),
                    message: 'Los productos no pueden compartir el code',
                    code: Error.INVALID_TYPES_ERROR
                });
            }

            let newProduct

            if(req.user) {
                if (req.user.role === 'premium') {
                    newProduct = {
                        title,
                        descripcion,
                        precio,
                        img,
                        code,
                        stock,
                        category,
                        owner: req.user.email
                    };
                } 
            } else {
                newProduct = {
                    title,
                    descripcion,
                    precio,
                    img,
                    code,
                    stock,
                    category
                };
            }

            console.log(newProduct);

            const productoAgregado = await this.productService.create(newProduct);

            console.log(productoAgregado);

            res.status(200).send({ status: 'success', payload: productoAgregado });

        } catch (error) {
            req.logger.error(error);
            next(error);
        }
    }

    updateProduct = async (req, res, next) => {
        try {

            const id = req.params.pid;
            const { title, descripcion, precio, img, code, stock, category } = req.body

            if (!title || !descripcion || !precio || !img || !code || !stock || !category) {
                req.logger.warning('Faltan campos necesarios para actualizar el producto');

                CustomError.createError({
                    name: 'Error al actualizar producto',
                    cause: createProductError({ title, descripcion, precio, img, code, stock, category }),
                    message: 'Faltan campos necesarios',
                    code: Error.INVALID_TYPES_ERROR
                });
            } else {
                const productoActualizado = await this.productService.update({ _id: id }, req.body);
                req.logger.info(JSON.stringify(productoActualizado, null, 2));
                res.status(200).send({ status: 'success', payload: productoActualizado });
            }

        } catch (error) {
            req.logger.error(error);
            next(error);
        }
    }

    deleteProduct = async (req, res, next) => {
        try {

            const id = req.params.pid;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                req.logger.warning('El producto no fue encontrado');

                CustomError.createError({
                    name: 'Error al encontrar producto',
                    cause: notFoundProduct(id),
                    message: 'El producto no fue encontrado',
                    code: Error.DATABASE_ERROR
                });
            }

            const productoEncontrado = await this.productService.get({ _id: id });

            if (!productoEncontrado) {
                req.logger.warning('El producto no fue encontrado');

                CustomError.createError({
                    name: 'Error al encontrar producto',
                    cause: notFoundProduct(id),
                    message: 'El producto no fue encontrado',
                    code: Error.DATABASE_ERROR
                });
            }

            if (productoEncontrado.owner === req.user.email) {

                const productoEliminado = await this.productService.delete({ _id: productoEncontrado._id });

                res.status(200).send({ status: 'success', payload: productoEliminado });

            } else if (req.user.role === 'admin') {
                const productoEliminado = await this.productService.delete({ _id: productoEncontrado._id });

                res.status(200).send({ status: 'success', payload: productoEliminado });

            } else if (req.user.role != 'admin' && productoEncontrado.owner != req.user.email) {
                res.status(400).send({status: 'error', message: 'Solo puedes borrar aquellos productos que tu mismo creaste'});
            }

        } catch (error) {
            req.logger.error(error);
            next(error);
        }
    }

    mockingProducts = (req, res) => {
        try {
            let users = [];

            for (let i = 0; i < 100; i++) {
                users.push(generateProduct());
            }

            res.send({ status: 'success', payload: users });

        } catch (error) {
            req.logger.error(error);
        }
    }
}

export default ProductController