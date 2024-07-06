export class CartRepository {
    constructor(CartDao){
        this.cartDao = CartDao
    }

    getAll = async () => await this.cartDao.getAll();
    get = async filter => await this.cartDao.get(filter);
    create = async nuevoCarrito => await this.cartDao.create(nuevoCarrito);
    delete = async id => await this.cartDao.delete(id);
}