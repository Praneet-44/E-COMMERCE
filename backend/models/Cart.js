const mongoose = require('mongoose');
const { getModel } = require('../utils/db');

const cartSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  product_id: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  color: { type: String },
  size: { type: String }
}, { timestamps: true });

try {
  mongoose.model('Cart');
} catch (e) {
  mongoose.model('Cart', cartSchema);
}

module.exports = getModel('Cart', cartSchema, 'carts');
