const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

exports.createOrder = async (req, res) => {
  try {
    const { billing_details, payment_method, coupon_code } = req.body;
    const user_id = req.user.id;

    // Get cart items
    const cartItems = await Cart.find({ user_id });
    if (!cartItems.length) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    let items = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product_id} not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Product ${product.name} is out of stock.` });
      }

      const price = product.price * (1 - (product.discount || 0) / 100);
      items.push({
        product_id: item.product_id,
        name: product.name,
        quantity: item.quantity,
        price,
        color: item.color,
        size: item.size
      });

      subtotal += price * item.quantity;
    }

    // Apply Coupon
    let discount_amount = 0;
    if (coupon_code) {
      const code = coupon_code.toUpperCase();
      if (code === 'FASHION20') {
        discount_amount = subtotal * 0.20;
      } else if (code === 'WELCOME10') {
        discount_amount = subtotal * 0.10;
      } else if (code === 'LUXE500') {
        discount_amount = Math.min(500, subtotal * 0.5);
      }
    }

    const tax = Math.round((subtotal - discount_amount) * 0.18); // 18% GST
    const shipping = subtotal - discount_amount > 2000 ? 0 : 1; // Free shipping over 2000, else ₹1
    const total_amount = Math.round(subtotal - discount_amount + tax + shipping);

    // Deduct stock
    for (const item of cartItems) {
      const product = await Product.findById(item.product_id);
      await Product.findByIdAndUpdate(item.product_id, {
        stock: product.stock - item.quantity
      });
    }

    // Create Order
    const order = await Order.create({
      user_id,
      items,
      total_amount,
      discount_amount,
      tax,
      shipping,
      billing_details,
      payment_method,
      payment_status: payment_method === 'COD' || payment_method === 'UPI' ? 'Pending' : 'Paid',
      order_status: payment_method === 'UPI' ? 'Pending' : 'Confirmed'
    });

    // Clear Cart
    await Cart.deleteMany({ user_id });

    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server error creating order.' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id });
    // Sort orders by newest first
    orders.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const allOrders = await Order.find({});
    
    // Filter orders that contain products created by this seller
    const filteredOrders = [];
    
    for (const order of allOrders) {
      let containsSellerProduct = false;
      const orderItems = [];
      
      for (const item of order.items) {
        const product = await Product.findById(item.product_id);
        if (product && (product.seller_id === sellerId || req.user.role === 'admin')) {
          containsSellerProduct = true;
          orderItems.push(item);
        }
      }
      
      if (containsSellerProduct) {
        filteredOrders.push({
          ...order,
          items: orderItems // Show only items relevant to this seller
        });
      }
    }
    
    res.status(200).json(filteredOrders);
  } catch (err) {
    console.error('Get seller orders error:', err);
    res.status(500).json({ message: 'Server error fetching seller orders.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Verify user is owner of a product in the order or admin
    // For simplicity, allow any seller to update if authorized
    const updated = await Order.findByIdAndUpdate(req.params.id, { order_status }, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating order status.' });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // When seller confirms payment, also set order to Confirmed
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { payment_status: 'Paid', order_status: 'Confirmed' },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating payment status.' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const allOrders = await Order.find({ order_status: { $in: ['Confirmed', 'Shipped', 'Delivered'] } });
    
    let totalSales = 0;
    let totalRevenue = 0;
    let productsCount = await Product.countDocuments({ seller_id: sellerId });
    
    const monthlySales = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
    };
    
    const categorySales = {};

    for (const order of allOrders) {
      for (const item of order.items) {
        const prod = await Product.findById(item.product_id);
        if (prod && (prod.seller_id === sellerId || req.user.role === 'admin')) {
          const itemRev = item.price * item.quantity;
          totalRevenue += itemRev;
          totalSales += item.quantity;
          
          // Monthly trend
          const date = new Date(order.createdAt || order.created_at);
          const monthStr = date.toLocaleString('default', { month: 'short' });
          if (monthlySales[monthStr] !== undefined) {
            monthlySales[monthStr] += itemRev;
          }
          
          // Category distribution
          categorySales[prod.category] = (categorySales[prod.category] || 0) + itemRev;
        }
      }
    }

    res.status(200).json({
      summary: {
        totalRevenue: Math.round(totalRevenue),
        totalSales,
        productsCount,
        ordersCount: allOrders.length
      },
      monthlySales: Object.entries(monthlySales).map(([month, val]) => ({ month, amount: Math.round(val) })),
      categorySales: Object.entries(categorySales).map(([category, val]) => ({ category, amount: Math.round(val) }))
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Server error fetching analytics.' });
  }
};
