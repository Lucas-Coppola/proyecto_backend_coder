import mongoose, { connect } from "mongoose";
import { envConfig } from "../config/config.js ";

export let ProductsDao
export let CartsDao
export let UsersDao

switch (envConfig.dbPersistence) {
    case 'FS':
        // const {default: ProductsDaoFs} = await import('./products.fileSystem.js');
        // const {default: CartsDaoFs} = await import('./carts.fileSystem.js');

        // ProductsDao = ProductsDaoFs;
        // CartsDao = CartsDaoFs;
        break;

    default:
        mongoose.connect(envConfig.dbUrl);
        const {ProductManager} = await import('./productsDao.mongo.js');
        const {CartsManager} = await import('./cartsDao.mongo.js');
        const {SessionManager} = await import('./sessionDao.mongo.js');

        ProductsDao = ProductManager;
        CartsDao = CartsManager;
        UsersDao = SessionManager;
        break;
}