const Review = require('../models/Review');

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.productId });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching reviews.' });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    
    const review = await Review.create({
      product_id: productId,
      user_name: req.user.name || 'Anonymous Buyer',
      rating: Number(rating),
      comment
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating review.' });
  }
};
