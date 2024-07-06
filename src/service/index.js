// import { CartsManager } from "../Dao/cartsDao.mongo.js";
import { CartsDao, ProductsDao, UsersDao } from "../Dao/factory.js";
import { CartRepository } from "../repositories/cart.repository.js";
// import { cartsModel, productsModel } from "../Dao/models/mongoDB.models.js";
// import { ProductManager } from "../Dao/productsDao.mongo.js";
// import { SessionManager } from "../Dao/sessionDao.mongo.js";
import { ProductRepository } from "../repositories/product.repository.js";
import { UserRepository } from "../repositories/user.repository.js";

export const ProductsService = new ProductRepository(new ProductsDao());
export const CartsService = new CartRepository(new CartsDao());
export const UsersService = new UserRepository(new UsersDao());