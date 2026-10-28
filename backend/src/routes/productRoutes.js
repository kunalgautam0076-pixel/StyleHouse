import express from 'express';
import {
  createProduct,
  deleteProduct,
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
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.get('/:slug', getProductBySlug);

export default router;