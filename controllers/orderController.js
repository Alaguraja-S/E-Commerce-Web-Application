const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/orders  (logged-in user checks out their cart)
async function createOrder(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const { items, shippingAddress } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty — add at least one item before checking out.' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: 'A shipping address is required.' });
    }

    let orderItems = [];
    let totalPrice = 0;

    await session.withTransaction(async () => {
      for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw Object.assign(new Error(`Product ${item.productId} no longer exists.`), { statusCode: 400 });
        }
        if (product.stock < item.quantity) {
          throw Object.assign(
            new Error(`Not enough stock for "${product.name}". Only ${product.stock} left.`),
            { statusCode: 400 }
          );
        }
        product.stock -= item.quantity;
        await product.save({ session });

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity
        });
        totalPrice += product.price * item.quantity;
      }

      await Order.create(
        [
          {
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            totalPrice: Math.round(totalPrice * 100) / 100
          }
        ],
        { session }
      );
    });

    const order = await Order.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  } finally {
    session.endSession();
  }
}

// GET /api/orders/mine  (logged-in user's own orders)
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders  (admin — all orders, optionally filtered by status)
async function getAllOrders(req, res, next) {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

// PUT /api/orders/:id/status  (admin — update order status)
async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
