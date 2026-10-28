import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { optionalProtect, protect } from '../middleware/auth.js';

const router = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many login attempts from this IP, please try again later.',
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', optionalProtect, getMe);

export default router;