export class ProductRepository {
    constructor(ProductDao){
        this.productDao = ProductDao
    }

    getAll = async filter => await this.productDao.getAll(filter);
    get = async filter => await this.productDao.get(filter);
    create = async nuevoProducto => await this.productDao.create(nuevoProducto);
    update = async (id, updatedProduct) => await this.productDao.update(id, updatedProduct);
    delete = async id => await this.productDao.delete(id);
}