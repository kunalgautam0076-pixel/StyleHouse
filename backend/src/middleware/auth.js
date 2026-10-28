import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in cookies
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  // Fallback to Bearer token in headers (useful for mobile apps/testing)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token || token === 'none') {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists and attach to req
    req.user = await User.findById(decoded.id);

    if (!req.user) {
       return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
    }

    if (req.user.accountStatus !== 'active') {
        return res.status(403).json({ success: false, message: 'Your account is not active.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

export const optionalProtect = (req, res, next) => {
  const hasCookieToken = req.cookies?.token && req.cookies.token !== 'none';
  const hasBearerToken = req.headers.authorization?.startsWith('Bearer ');

  if (!hasCookieToken && !hasBearerToken) {
    return next();
  }

  return protect(req, res, next);
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};