import express from 'express';
import {
  addOrderItems,
  createRazorpayOrder,
  getAdminOrders,
  getMyOrders,
  updateOrderStatus,
  verifyRazorpayPayment,
} from '../controllers/orderController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/myorders', protect, getMyOrders);
router.get('/admin', protect, authorize('admin'), getAdminOrders);
router.patch('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.post('/', protect, addOrderItems);
router.post('/razorpay', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyRazorpayPayment);

export default router;