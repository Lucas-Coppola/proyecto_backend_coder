import { Router } from 'express';
import ProductController from '../../controllers/product.controller.js';
import { auth } from '../../middlewares/auth.middleware.js';

const router = Router();

const {
    getProducts,
    getFilteredProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = new ProductController();

router.get('/', getProducts);

router.get('/:pid', getFilteredProducts);

router.post('/', auth, createProduct);

router.put('/:pid', auth, updateProduct);

router.delete('/:pid', auth, deleteProduct);

export default router