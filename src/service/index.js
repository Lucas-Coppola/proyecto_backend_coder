import { CartsDao, ProductsDao, UsersDao } from "../Dao/factory.js";
import { CartRepository } from "../repositories/cart.repository.js";
import { ProductRepository } from "../repositories/product.repository.js";
import { UserRepository } from "../repositories/user.repository.js";

export const ProductsService = new ProductRepository(new ProductsDao());
export const CartsService = new CartRepository(new CartsDao());
export const UsersService = new UserRepository(new UsersDao());