import { cartsModel, productsModel } from "./models/mongoDB.models.js";

export class CartsManager {
    constructor() {
        this.carts = cartsModel;
        this.products = productsModel
    }

    async getAll() {
        return await this.carts.find({});
    }

    async create(nuevoCarrito) {
        return await this.carts.create(nuevoCarrito);
    }

    async get(filter) {
        return await this.carts.findOne(filter);
    }

    async delete(id) {
        return await this.carts.deleteOne(id)
    }
}