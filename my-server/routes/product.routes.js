const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// GET all products
router.get('/', async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, search, sort } = req.query;
    
    let query = {};
    
    if (category && category !== 'All Categories') {
      query.category = category;
    }
    
    if (brand) {
      query.brand = brand;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    let sortObj = {};
    switch(sort) {
      case 'Price: Low to High':
        sortObj.price = 1;
        break;
      case 'Price: High to Low':
        sortObj.price = -1;
        break;
      case 'Newest':
        sortObj.createdAt = -1;
        break;
      default:
        sortObj.rating = -1;
    }
    
    const products = await Product.find(query).sort(sortObj);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ POST - Nhận Base64
router.post('/', async (req, res) => {
  try {
    // req.body đã chứa image dưới dạng Base64
    const product = new Product(req.body);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ PUT - Cập nhật với Base64
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,  // ← Nhận toàn bộ body (bao gồm Base64)
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET featured products
router.get('/featured/list', async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;