import { createHmac, timingSafeEqual } from 'crypto';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { getRazorpayClient } from '../utils/razorpay.js';

const createRequestError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const prepareOrder = async ({ cartItems, shippingAddress }) => {
  const addressFields = ['fullName', 'address', 'city', 'postalCode', 'country', 'phone'];
  if (
    !shippingAddress
    || addressFields.some(field => typeof shippingAddress[field] !== 'string' || !shippingAddress[field].trim())
  ) {
    throw createRequestError('Please provide all required shipping information.');
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0 || cartItems.length > 50) {
    throw createRequestError('Your cart is empty or contains too many items.');
  }

  const groupedItems = new Map();
  cartItems.forEach(item => {
    if (
      !mongoose.isValidObjectId(item.productId)
      || typeof item.size !== 'string'
      || !item.size.trim()
      || !Number.isInteger(item.quantity)
      || item.quantity < 1
      || item.quantity > 50
    ) {
      throw createRequestError('One or more cart items are invalid. Please review your cart.');
    }

    const size = item.size.trim();
    const key = `${item.productId}:${size}`;
    const existing = groupedItems.get(key);
    const quantity = (existing?.quantity || 0) + item.quantity;
    if (quantity > 50) {
      throw createRequestError('A cart item quantity exceeds the allowed limit.');
    }
    groupedItems.set(key, { productId: item.productId, size, quantity });
  });
  const normalizedItems = [...groupedItems.values()];

  const productIds = [...new Set(normalizedItems.map(item => item.productId))];
  const products = await Product.find({
    _id: { $in: productIds },
    isPublished: true,
  });
  const productsById = new Map(products.map(product => [product._id.toString(), product]));

  let itemsAmountPaise = 0;
  const orderItems = normalizedItems.map(item => {
    const product = productsById.get(item.productId);
    if (!product) {
      throw createRequestError('A product in your cart is no longer available. Please refresh your cart.');
    }

    const variant = product.variants.find(candidate => candidate.size === item.size);
    if (!variant) {
      throw createRequestError(`${product.name} is no longer available in size ${item.size}.`);
    }
    if (variant.stockQuantity < item.quantity) {
      throw createRequestError(`Only ${variant.stockQuantity} units of ${product.name} in size ${item.size} remain.`);
    }

    const unitPricePaise = Math.round(product.price * 100);
    itemsAmountPaise += unitPricePaise * item.quantity;

    return {
      name: product.name,
      qty: item.quantity,
      image: product.images.find(image => image.isPrimary)?.url
        || product.images[0]?.url
        || 'https://placehold.co/600x800?text=StyleHouse',
      price: unitPricePaise / 100,
      size: item.size,
      product: product._id,
    };
  });

  const shippingAmountPaise = itemsAmountPaise > 20000 ? 0 : 1500;
  const totalAmountPaise = itemsAmountPaise + shippingAmountPaise;

  if (totalAmountPaise < 100) {
    throw createRequestError('The payment total must be at least ₹1.');
  }

  return {
    orderItems,
    shippingAddress: Object.fromEntries(
      addressFields.map(field => [field, shippingAddress[field].trim()])
    ),
    itemsPrice: itemsAmountPaise / 100,
    shippingPrice: shippingAmountPaise / 100,
    totalPrice: totalAmountPaise / 100,
    totalAmountPaise,
  };
};

// @desc    Create a cash-on-delivery order using server-calculated prices
// @route   POST /api/v1/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  try {
    const orderDetails = await prepareOrder(req.body);
    const order = await Order.create({
      user: req.user._id,
      ...orderDetails,
      paymentMethod: 'COD',
      orderStatus: 'Processing',
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a server-priced Razorpay order
// @route   POST /api/v1/orders/razorpay
// @access  Private
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { client, keyId } = getRazorpayClient();
    const orderDetails = await prepareOrder(req.body);
    const orderId = new mongoose.Types.ObjectId();
    const razorpayOrder = await client.orders.create({
      amount: orderDetails.totalAmountPaise,
      currency: 'INR',
      receipt: orderId.toString(),
      notes: {
        orderId: orderId.toString(),
        userId: req.user._id.toString(),
      },
    });

    await Order.create({
      _id: orderId,
      user: req.user._id,
      orderItems: orderDetails.orderItems,
      shippingAddress: orderDetails.shippingAddress,
      itemsPrice: orderDetails.itemsPrice,
      shippingPrice: orderDetails.shippingPrice,
      totalPrice: orderDetails.totalPrice,
      paymentMethod: 'Razorpay',
      razorpayOrderId: razorpayOrder.id,
      orderStatus: 'Payment Pending',
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: orderId.toString(),
        razorpayOrderId: razorpayOrder.id,
        keyId,
        amount: orderDetails.totalAmountPaise,
        currency: 'INR',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a Razorpay payment and mark the order paid
// @route   POST /api/v1/orders/verify-payment
// @access  Private
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;

    if (
      !mongoose.isValidObjectId(orderId)
      || typeof razorpayOrderId !== 'string'
      || typeof paymentId !== 'string'
      || typeof signature !== 'string'
      || !/^[a-f0-9]{64}$/i.test(signature)
    ) {
      throw createRequestError('Payment verification details are invalid.');
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      razorpayOrderId,
      paymentMethod: 'Razorpay',
    });
    if (!order) {
      throw createRequestError('The payment order could not be found.', 404);
    }

    const { client } = getRazorpayClient();
    const expectedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest();
    const receivedSignature = Buffer.from(signature, 'hex');
    if (!timingSafeEqual(expectedSignature, receivedSignature)) {
      throw createRequestError('Razorpay payment signature verification failed.', 400);
    }

    let payment = await client.payments.fetch(paymentId);
    const expectedAmount = Math.round(order.totalPrice * 100);

    if (
      payment.order_id !== razorpayOrderId
      || payment.amount !== expectedAmount
      || payment.currency !== 'INR'
    ) {
      throw createRequestError('The payment does not match this order.', 400);
    }

    if (payment.status === 'authorized') {
      payment = await client.payments.capture(paymentId, expectedAmount, 'INR');
    }
    if (payment.status !== 'captured') {
      throw createRequestError('Razorpay has not captured this payment yet.', 409);
    }

    if (order.isPaid && order.paymentResult.id !== paymentId) {
      throw createRequestError('This order has already been paid with another payment.', 409);
    }

    if (!order.isPaid) {
      const paidOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          user: req.user._id,
          razorpayOrderId,
          isPaid: false,
        },
        {
          $set: {
            isPaid: true,
            paidAt: new Date(),
            orderStatus: 'Processing',
            paymentResult: {
              id: paymentId,
              orderId: razorpayOrderId,
              status: payment.status,
              update_time: new Date().toISOString(),
            },
          },
        },
        { new: true, runValidators: true }
      );

      if (paidOrder) {
        return res.status(200).json({ success: true, data: paidOrder });
      }

      const existingPaidOrder = await Order.findOne({
        _id: order._id,
        user: req.user._id,
        isPaid: true,
      });
      if (existingPaidOrder?.paymentResult?.id !== paymentId) {
        throw createRequestError('This order has already been paid with another payment.', 409);
      }
      return res.status(200).json({ success: true, data: existingPaidOrder });
    }

    res.status(200).json({ success: true, data: order });
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

// @desc    Get all orders for store administration
// @route   GET /api/v1/orders/admin
// @access  Private/Admin
export const getAdminOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fulfillment status for an order
// @route   PATCH /api/v1/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const allowedStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const { orderStatus } = req.body;

    if (!mongoose.isValidObjectId(req.params.id) || !allowedStatuses.includes(orderStatus)) {
      throw createRequestError('Select a valid fulfillment status.');
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      throw createRequestError('Order not found.', 404);
    }

    if (order.orderStatus === 'Cancelled' && orderStatus !== 'Cancelled') {
      throw createRequestError('Cancelled orders cannot be reopened.', 409);
    }
    if (orderStatus !== 'Cancelled' && !order.isPaid && order.paymentMethod !== 'COD') {
      throw createRequestError('This order cannot be fulfilled until payment is complete.', 409);
    }
    if (orderStatus === 'Cancelled' && order.paymentMethod === 'Razorpay') {
      throw createRequestError(
        order.isPaid
          ? 'Refund the captured Razorpay payment before cancelling this order.'
          : 'Resolve the pending Razorpay payment before cancelling this order.',
        409,
      );
    }

    order.orderStatus = orderStatus;
    order.isDelivered = orderStatus === 'Delivered';
    order.deliveredAt = order.isDelivered ? (order.deliveredAt || new Date()) : undefined;

    const updatedOrder = await order.save();
    await updatedOrder.populate('user', 'name email');

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};