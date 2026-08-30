const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware()); // Protect all order routes

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/seller-orders', authMiddleware(['seller', 'admin']), orderController.getSellerOrders);
router.put('/:id/status', authMiddleware(['seller', 'admin']), orderController.updateOrderStatus);
router.put('/:id/payment', authMiddleware(['seller', 'admin']), orderController.updatePaymentStatus);
router.get('/analytics', authMiddleware(['seller', 'admin']), orderController.getAnalytics);

module.exports = router;
