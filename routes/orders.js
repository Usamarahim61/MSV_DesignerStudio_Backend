const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/', orderController.placeOrder);

// Protected routes (admin only)
router.get('/', verifyToken, orderController.getOrders);
router.get('/:id', verifyToken, orderController.getOrderById);
router.put('/:id/status', verifyToken, orderController.updateOrderStatus);
router.delete('/:id', verifyToken, orderController.deleteOrder);

module.exports = router;
