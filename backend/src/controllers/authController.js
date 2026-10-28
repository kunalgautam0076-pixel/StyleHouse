import User from '../models/User.js';
import { sendTokenResponse } from '../utils/authUtils.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    // 1. Validate request body using Zod
    const validatedData = registerSchema.parse(req.body);

    // 2. Check if user already exists
    const userExists = await User.findOne({ email: validatedData.email });
    if (userExists) {
      const error = new Error('User already exists');
      error.statusCode = 400;
      throw error;
    }

    // 3. Create user
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash: validatedData.password, // Schema hook will hash this
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    if (error.name === 'ZodError') {
      const formattedErrors = error.errors.map((e) => e.message);
      return res.status(400).json({ success: false, message: formattedErrors[0] });
    }
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Check for user and explicitly select the passwordHash field
    const user = await User.findOne({ email: validatedData.email }).select('+passwordHash');

    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Check if password matches
    const isMatch = await user.matchPassword(validatedData.password);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    if (user.accountStatus !== 'active') {
        const error = new Error('Your account has been suspended or deactivated.');
        error.statusCode = 403;
        throw error;
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};