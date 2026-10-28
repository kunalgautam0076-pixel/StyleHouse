import express from 'express';
import {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
} from '../controllers/productController.js';
import { optionalProtect, protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.route('/')
  .get(optionalProtect, getProducts)
  .post(protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.get('/:slug', getProductBySlug);

export default router;