import { Router } from 'express';
import CartsController from '../../controllers/carts.controller.js';

const router = Router();

const {
    getCarts,
    createCart,
    getCart,
    addProductToCart, 
    deleteProduct,
    deleteCart,
    updateQuantity,
    updateProductFromCart
} = new CartsController()

router.get('/', getCarts);

router.post('/', createCart);

router.get('/:cid', getCart);

router.post('/:cid/product/:pid', addProductToCart);

router.delete('/:cid/product/:pid', deleteProduct);

router.delete('/:cid', deleteCart);

router.put('/:cid/product/:pid', updateQuantity);

router.put('/:cid/updateProduct/:pid', updateProductFromCart);

export default router