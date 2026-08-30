const mongoose = require('mongoose');
const { getModel } = require('../utils/db');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' }
}, { timestamps: true });

try {
  mongoose.model('User');
} catch (e) {
  mongoose.model('User', userSchema);
}

module.exports = getModel('User', userSchema, 'users');
