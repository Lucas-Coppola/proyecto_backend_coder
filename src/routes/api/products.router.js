import { Router } from 'express';
import ProductController from '../../controllers/product.controller.js';

const router = Router();

const {
    getProducts,
    getFilteredProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    mockingProducts
} = new ProductController();

router.get('/', getProducts);

router.get('/mockingproducts', mockingProducts);

router.get('/:pid', getFilteredProducts);

router.post('/', createProduct);

router.put('/:pid', updateProduct);

router.delete('/:pid', deleteProduct);

export default router