/**
 * @typedef {object} Producto
 * @property {string} title
 * @property {string} descripcion
 * @property {number} precio
 * @property {URL} img
 * @property {string} code
 * @property {number} stock
 * @property {string} category
 * @property {boolean} status
*/

import fs from 'fs';
const path = 'productos.json';

class productManager {

    /** @type {Array<Producto>} */
    #productos

    constructor() {
        this.#productos = [];
        this.path = path
    }

    async leerArchivo() {
        try {
            const leerProductos = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(leerProductos);
        } catch (error) {
            return this.#productos = [];
        }
    }

    async agregarProducto(title, descripcion, precio, img, code, stock, category ) {
        try {
            
            const existeProducto = this.#productos.some(producto => producto.code === code);

            if (!title || !descripcion || !precio || !img || !code || !stock || !category) {
                console.log('Por favor, complete todos los campos para agregar producto');
            } else if (existeProducto) {
                console.log('Los productos no pueden compartir el code');
            } else {
                const nuevoProducto = {
                    title,
                    descripcion,
                    precio,
                    img,
                    code,
                    id: this.#getIncrementarId(),
                    stock,
                    category,
                    status: true
                };

                this.#productos.push(nuevoProducto);
                await fs.promises.writeFile(this.path, JSON.stringify(this.#productos, null, '\t'), 'utf-8');

                return nuevoProducto;
            }
        } catch (error) {
            console.log(error);
        }
    }


    #getIncrementarId() {
        if (this.#productos.length === 0) {
            return 1
        } else {
            return this.#productos.at(-1).id + 1;
        }
    }

    async getProductos() {
        const productosParseados = await this.leerArchivo();
        return productosParseados;
    }

    async getProductById(id) {
        const productosParseados = await this.leerArchivo();
        const productoEncontrado = productosParseados.find(producto => producto.id === id);
        if (productoEncontrado) {
            return productoEncontrado
        } else {
            console.log('Not Found');
        }
    }

    async updateProduct(id, title, descripcion, precio, img, code, stock) {

        const productosParseados = await this.leerArchivo();
        const indexProductoModificar = productosParseados.findIndex(producto => producto.id === id);

        if (indexProductoModificar !== -1) {
            const productoModificado = {
                ...productosParseados[indexProductoModificar],
                title: title !== undefined ? title : productosParseados[indexProductoModificar].title,
                descripcion: descripcion !== undefined ? descripcion : productosParseados[indexProductoModificar].descripcion,
                precio: precio !== undefined ? precio : productosParseados[indexProductoModificar].precio,
                img: img !== undefined ? img : productosParseados[indexProductoModificar].img,
                code: code !== undefined ? code : productosParseados[indexProductoModificar].code,
                stock: stock !== undefined ? stock : productosParseados[indexProductoModificar].stock,
                id
            };

            productosParseados[indexProductoModificar] = productoModificado;
            await fs.promises.writeFile(this.path, JSON.stringify(productosParseados, null, '\t'), 'utf-8');
        } else {
            console.log('Producto no encontrado');
        }
    }

    async deleteProduct(id) {
        let productosParseados = await this.leerArchivo();
        productosParseados = productosParseados.filter(producto => producto.id !== id);
        await fs.promises.writeFile(this.path, JSON.stringify(productosParseados, null, '\t'), 'utf-8');
    }
}

// MANERA ASYNC DE REPRODUCIR EL CODE
const reproducirPrograma = async () => {
    const productoManager = new productManager();
    console.log(await productoManager.getProductos());
    await productoManager.agregarProducto('producto 1', 'gran producto', 1000, './img', 'ABC124', 2, 'consola');
    await productoManager.agregarProducto('producto 2', 'pesimo producto', 1000, './img', 'ABC123', 2, 'PC');
    await productoManager.agregarProducto('producto 3', 'medio producto', 1000, './img', 'ABC125', 2, 'consola');
    await productoManager.agregarProducto('producto 4', 'medio producto', 1000, './img', 'ABC122', 2, 'telefono');
    await productoManager.agregarProducto('producto 5', 'medio producto', 1000, './img', 'ABC126', 2, 'PC');
    await productoManager.agregarProducto('producto 6', 'medio producto', 1000, './img', 'ABC127', 2, 'telefono');
    await productoManager.agregarProducto('producto 7', 'medio producto', 1000, './img', 'ABC128', 2, 'electrodomestico');
    await productoManager.agregarProducto('producto 8', 'medio producto', 1000, './img', 'ABC129', 2, 'PC');
    await productoManager.agregarProducto('producto 9', 'medio producto', 1000, './img', 'ABC130', 2, 'consola');
    await productoManager.agregarProducto('producto 10', 'medio producto', 1000, './img', 'ABC131', 2, 'electrodomestico');
    // console.log(await productoManager.getProductos());
    // console.log(await productoManager.getProductById(3));
    // await productoManager.updateProduct(3, undefined, undefined, 1300, undefined, undefined, 3);
    // await productoManager.deleteProduct(3);
    // console.log(await productoManager.getProductos());
    // console.log(await productoManager.getProductById(3));
    // console.log(await productoManager.getProductos());
}

reproducirPrograma();

export default productManager;