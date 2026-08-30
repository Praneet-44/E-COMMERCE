const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    const items = await Cart.find({ user_id: req.user.id });
    
    // Populate product details manually to be safe for both Mongoose and Mock database
    const populated = [];
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (product) {
        populated.push({
          id: item.id || item._id,
          product_id: item.product_id,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          product: {
            name: product.name,
            price: product.price,
            discount: product.discount,
            images: product.images,
            stock: product.stock
          }
        });
      }
    }
    res.status(200).json(populated);
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: 'Server error fetching cart.' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity, color, size } = req.body;
    const user_id = req.user.id;

    // Check if product exists and is in stock
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Requested quantity exceeds stock.' });
    }

    // Check if already in cart
    const existing = await Cart.findOne({ user_id, product_id, color, size });
    if (existing) {
      const newQty = existing.quantity + (quantity || 1);
      if (product.stock < newQty) {
        return res.status(400).json({ message: 'Requested quantity exceeds stock.' });
      }
      const updated = await Cart.findByIdAndUpdate(existing.id || existing._id, { quantity: newQty }, { new: true });
      return res.status(200).json(updated);
    }

    const newItem = await Cart.create({
      user_id,
      product_id,
      quantity: quantity || 1,
      color,
      size
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Server error adding to cart.' });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await Cart.findById(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    if (cartItem.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const product = await Product.findById(cartItem.product_id);
    if (product && product.stock < quantity) {
      return res.status(400).json({ message: 'Requested quantity exceeds stock.' });
    }

    const updated = await Cart.findByIdAndUpdate(req.params.id, { quantity }, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating cart.' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cartItem = await Cart.findById(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    if (cartItem.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Item removed from cart.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error removing item.' });
  }
};
