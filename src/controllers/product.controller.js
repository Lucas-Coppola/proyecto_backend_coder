// import { productsModel } from '../Dao/models/mongoDB.models.js';
import { productsModel } from '../Dao/models/mongoDB.models.js';
import { ProductsService } from '../service/index.js';

class ProductController {
    constructor() {
        this.productService = ProductsService
    }

    getProducts = async (req, res) => {
        try {
            console.log(req.user);

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
            console.log(error);
            res.status(500).send('Error interno del servidor');
        }
    }

    getFilteredProducts = async (req, res) => {
        const id = req.params.pid;

        const productosFiltradosId = await this.productService.get({ _id: id });

        res.send(productosFiltradosId);
    }

    createProduct = async (req, res) => {
        try {
            if(req.user.role === 'admin') {
                const { title, descripcion, precio, img, code, stock, category } = req.body

                const existeProducto = await this.productService.get({ code });
    
                if (!title || !descripcion || !precio || !img || !code || !stock || !category) {
                    console.log('Por favor, complete todos los campos para agregar producto');
                    return res.send({ status: 'error', error: 'faltan campos' });
                }
                else if (existeProducto) {
                    console.log('Los productos no pueden compartir el code');
                    return res.send({ status: 'error', error: 'los productos no pueden compartir el code' });
                }
    
                const productoAgregado = await this.productService.create(req.body);
    
                res.status(200).send({ status: 'success', payload: productoAgregado });
            }  else return res.send('Usted debe de estar logueado y ser administrador para realizar esta tarea');

        } catch (error) {
            console.log(error);
            res.status(500).send({ error: 'Error interno del servidor.' });
        }
    }

    updateProduct = async (req, res) => {
        if (req.user.role === 'admin') {
            try {

                const id = req.params.pid;
                const { title, descripcion, precio, img, code, stock, category } = req.body

                if (!title || !descripcion || !precio || !img || !code || !stock || !category) {
                    console.log('Por favor, complete todos los campos para actualizar');
                    return res.send({ status: 'error', error: 'faltan campos' });
                } else {
                    const productoActualizado = await this.productService.update({ _id: id }, req.body);
                    console.log(productoActualizado);
                    res.status(200).send({ status: 'success', payload: productoActualizado });
                }

            } catch (error) {
                console.log(error);
                return res.send({ status: 'error', error: 'Not found' });
            }
        } else return res.send('Usted debe de estar logueado y ser administrador para realizar esta tarea');
    }

    deleteProduct = async (req, res) => {
        if (req.user.role === 'admin') {
            const id = req.params.pid;

            const productoEliminado = await this.productService.delete({ _id: id });

            res.status(200).send({ status: 'success', payload: productoEliminado });
        } else return res.send('Usted debe de estar logueado y ser administrador para realizar esta tarea');
    }
}

export default ProductController