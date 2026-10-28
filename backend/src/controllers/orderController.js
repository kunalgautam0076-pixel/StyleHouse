import Order from '../models/Order.js';

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private (User must be logged in)
export const addOrderItems = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      const error = new Error('No order items');
      error.statusCode = 400;
      throw error;
    } else {
      const order = new Order({
        user: req.user._id, // Got this from the protect middleware
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();

      res.status(201).json({
        success: true,
        data: createdOrder,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/v1/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};