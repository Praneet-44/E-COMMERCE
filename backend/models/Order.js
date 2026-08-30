const mongoose = require('mongoose');
const { getModel } = require('../utils/db');

const orderSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  items: [{
    product_id: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    color: { type: String },
    size: { type: String }
  }],
  total_amount: { type: Number, required: true },
  discount_amount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  billing_details: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  payment_method: { type: String, required: true },
  payment_status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  order_status: { type: String, enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

try {
  mongoose.model('Order');
} catch (e) {
  mongoose.model('Order', orderSchema);
}

module.exports = getModel('Order', orderSchema, 'orders');
