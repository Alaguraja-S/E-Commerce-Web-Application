const express = require('express');
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/', protect, requireRole('admin'), getAllOrders);
router.put('/:id/status', protect, requireRole('admin'), updateOrderStatus);

module.exports = router;
