import { productsModel } from "./models/mongoDB.models.js"

export class ProductManager {
    constructor(){
        this.products = productsModel
    }

    async getAll(filter) {
        return await this.products.find(filter);
    }

    async get(filter) {
        return await this.products.findOne(filter).lean();
    }

    async create(nuevoProducto) {
        return await this.products.create(nuevoProducto);
    }

    async update(id, updatedProduct) {
        return await this.products.updateOne({_id: id}, updatedProduct);
    }

    async delete(id) {
        return await this.products.deleteOne(id);
    }
}