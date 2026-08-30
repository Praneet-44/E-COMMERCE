const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// Route can be accessed either authenticated or unauthenticated (optional auth checking)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fashionhub-super-secret-key');
      req.user = decoded;
    } catch (err) {
      // Allow unauthenticated fallback
    }
  }
  next();
};

router.post('/chat', optionalAuth, aiController.chat);

module.exports = router;
