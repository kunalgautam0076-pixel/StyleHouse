import express from 'express';
import {
  addOrderItems,
  createRazorpayOrder,
  getMyOrders,
  verifyRazorpayPayment,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/myorders', protect, getMyOrders);
router.post('/', protect, addOrderItems);
router.post('/razorpay', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyRazorpayPayment);

export default router;