const mongoose = require('mongoose');
const { getModel } = require('../utils/db');

const reviewSchema = new mongoose.Schema({
  product_id: { type: String, required: true },
  user_name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

try {
  mongoose.model('Review');
} catch (e) {
  mongoose.model('Review', reviewSchema);
}

module.exports = getModel('Review', reviewSchema, 'reviews');
