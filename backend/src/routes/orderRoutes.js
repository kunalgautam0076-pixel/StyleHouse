import express from 'express';
import { addOrderItems, getMyOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/myorders', protect, getMyOrders);
router.post('/', protect, addOrderItems);

export default router;