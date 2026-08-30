const mongoose = require('mongoose');
const { getModel } = require('../utils/db');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  seller_id: { type: String, required: true },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  gender: { type: String, enum: ['Men', 'Women', 'Kids', 'Unisex'], default: 'Unisex' },
  status: { type: String, enum: ['Active', 'Draft'], default: 'Active' }
}, { timestamps: true });

try {
  mongoose.model('Product');
} catch (e) {
  mongoose.model('Product', productSchema);
}

module.exports = getModel('Product', productSchema, 'products');
