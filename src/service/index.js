import { CartsManager } from "../Dao/cartsDao.mongo.js";
import { cartsModel, productsModel } from "../Dao/models/mongoDB.models.js";
import { ProductManager } from "../Dao/productsDao.mongo.js";
import { SessionManager } from "../Dao/sessionDao.mongo.js";

export const ProductsService = new ProductManager();
export const CartsService = new CartsManager();
export const UsersService = new SessionManager();