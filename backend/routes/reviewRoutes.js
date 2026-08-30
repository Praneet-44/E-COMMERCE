const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:productId', reviewController.getProductReviews);
router.post('/:productId', authMiddleware(), reviewController.createReview);

module.exports = router;
