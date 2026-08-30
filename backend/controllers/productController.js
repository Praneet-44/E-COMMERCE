const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const saveBase64Image = (base64Str) => {
  if (!base64Str || !base64Str.startsWith('data:image/')) {
    return base64Str;
  }

  try {
    const matches = base64Str.match(/^data:image\/([A-Za-z+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Str;
    }

    const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');
    
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}.${extension}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, imageBuffer);
    return filename;
  } catch (err) {
    console.error('Error saving base64 image:', err);
    return base64Str;
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, size, color, gender, minPrice, maxPrice, search, sort } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (gender) filter.gender = gender;
    
    if (size) {
      filter.sizes = { $in: [size] };
    }
    if (color) {
      filter.colors = { $in: [color] };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    let products = await Product.find(filter);

    // Apply sorting
    if (sort) {
      if (sort === 'price_asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'newest') {
        products.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
      } else if (sort === 'best_selling') {
        // Mock sorting for best selling
        products.sort((a, b) => (b.stock || 0) - (a.stock || 0));
      }
    }

    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error fetching products.' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching product.' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, discount, stock, category, images, sizes, colors, gender } = req.body;
    
    // Ensure user is seller or admin
    const sellerId = req.user.id;

    let processedImages = [];
    if (images && Array.isArray(images)) {
      processedImages = images.map(img => {
        const result = saveBase64Image(img);
        if (result && !result.startsWith('http') && !result.startsWith('data:')) {
          const protocol = req.protocol;
          const host = req.get('host');
          return `${protocol}://${host}/uploads/${result}`;
        }
        return result;
      });
    } else {
      processedImages = ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600&auto=format&fit=crop'];
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      discount: Number(discount || 0),
      stock: Number(stock),
      category,
      images: processedImages,
      seller_id: sellerId,
      sizes: sizes || ['M', 'L'],
      colors: colors || ['Black'],
      gender: gender || 'Unisex',
      status: 'Active'
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Server error creating product.' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, discount, stock, category, images, sizes, colors, gender } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && product.seller_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product.' });
    }

    let processedImages = undefined;
    if (images && Array.isArray(images)) {
      processedImages = images.map(img => {
        const result = saveBase64Image(img);
        if (result && !result.startsWith('http') && !result.startsWith('data:')) {
          const protocol = req.protocol;
          const host = req.get('host');
          return `${protocol}://${host}/uploads/${result}`;
        }
        return result;
      });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, {
      name: name || product.name,
      description: description || product.description,
      price: price !== undefined ? Number(price) : product.price,
      discount: discount !== undefined ? Number(discount) : product.discount,
      stock: stock !== undefined ? Number(stock) : product.stock,
      category: category || product.category,
      images: processedImages || product.images,
      sizes: sizes || product.sizes,
      colors: colors || product.colors,
      gender: gender || product.gender
    }, { new: true });

    res.status(200).json(updated);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error updating product.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && product.seller_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product.' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting product.' });
  }
};
