import jwt from 'jsonwebtoken';

export const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Cookie cannot be accessed by client-side scripts
    secure: process.env.NODE_ENV === 'production', // Cookie sent only over HTTPS in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  // Remove passwordHash from output
  user.passwordHash = undefined;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user,
    });
};