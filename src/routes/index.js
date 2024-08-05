import { Router } from 'express';
import ProductRouter from './api/products.router.js';
import CartsRouter from './api/carts.router.js';
import ViewsRouter from './views.router.js';
import SessionsRouter from './api/sessions.router.js';
import LoggerRouter from '../utils/logger.js'

const router = Router();

router.use('/api/products', ProductRouter);
router.use('/api/carts', CartsRouter);
router.use('/api/sessions', SessionsRouter);
router.use('/', ViewsRouter);
router.use('/loggerTest', LoggerRouter);


export default router