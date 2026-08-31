const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./utils/db');

// Load configurations
dotenv.config();

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (Hybrid Mongoose/JSON)
connectDB();

// Global Middlewares
app.use(cors({
  origin: '*', // Allow connections from Next.js server locally
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded static images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);

// Root Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'FashionHub E-Commerce Service API is active.'
  });
});

// Start listening only when executed directly (not when required as a module/serverless handler)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Server] FashionHub active on port ${PORT}`);
  });
}

module.exports = app;

