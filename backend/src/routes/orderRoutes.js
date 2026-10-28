import express from 'express';
import { addOrderItems } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js'; // Requires user to be logged in

const router = express.Router();

// protect middleware ensures only logged-in users can create orders
router.post('/', protect, addOrderItems);

export default router;