const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', authMiddleware(['seller', 'admin']), productController.createProduct);
router.put('/:id', authMiddleware(['seller', 'admin']), productController.updateProduct);
router.delete('/:id', authMiddleware(['seller', 'admin']), productController.deleteProduct);

module.exports = router;
