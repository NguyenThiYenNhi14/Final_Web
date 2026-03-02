const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());
// ✅ THÊM LIMIT CHO BASE64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// connect MongoDB
mongoose.connect('mongodb://localhost:27017/sneaker_shop_db')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error(err));

// Routes
const productRoutes = require('./routes/product.routes');
app.use('/api/products', productRoutes);

// test API
app.get('/', (req, res) => {
  res.send('Sneaker Shop API is running');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});