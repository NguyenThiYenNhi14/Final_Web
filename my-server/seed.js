const mongoose = require('mongoose');
const Product = require('./models/product');
const fs = require('fs');
const path = require('path');

mongoose.connect('mongodb://localhost:27017/sneaker_shop_db')
  .then(() => console.log('✅ Connected to MongoDB'));

// ========== HÀM CONVERT ẢNH ==========
function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };
    const mimeType = mimeTypes[ext] || 'image/jpeg';
    const base64 = imageBuffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// ========== DỮ LIỆU SẢN PHẨM MẪU ==========
const productTemplates = [
  {
    name: "Nike Air Max 270",
    brand: "Nike",
    category: "Running",
    price: 3200000,
    originalPrice: 4000000,
    discount: 20,
    rating: 4.7,
    description: "Comfortable air cushion running shoes",
    color: "Black/White",
    store: "Nike Official Store",
    location: "Hanoi"
  },
  {
    name: "Adidas Ultraboost 22",
    brand: "Adidas",
    category: "Running",
    price: 2800000,
    originalPrice: 3500000,
    discount: 20,
    rating: 4.6,
    description: "Energy return running experience",
    color: "Core Black",
    store: "Adidas Official",
    location: "Ho Chi Minh"
  },
  {
    name: "Nike React Run",
    brand: "Nike",
    category: "Running",
    price: 2500000,
    originalPrice: 3000000,
    discount: 17,
    rating: 4.5,
    description: "Lightweight responsive cushioning",
    color: "Blue/White",
    store: "Nike Official Store",
    location: "Hanoi"
  },
  {
    name: "Adidas Boost",
    brand: "Adidas",
    category: "Running",
    price: 2600000,
    originalPrice: 3200000,
    discount: 19,
    rating: 4.6,
    description: "Premium boost technology",
    color: "White",
    store: "Adidas Official",
    location: "Da Nang"
  },
  {
    name: "Reebok Classic Leather",
    brand: "Reebok",
    category: "Casual",
    price: 1800000,
    originalPrice: 2200000,
    discount: 18,
    rating: 4.4,
    description: "Timeless classic design",
    color: "White",
    store: "Reebok Store",
    location: "Hanoi"
  },
  {
    name: "Nike Court Vision",
    brand: "Nike",
    category: "Casual",
    price: 1900000,
    originalPrice: 2400000,
    discount: 21,
    rating: 4.3,
    description: "Street style basketball shoes",
    color: "White/Black",
    store: "Nike Official Store",
    location: "Ho Chi Minh"
  },
  {
    name: "Adidas Stan Smith",
    brand: "Adidas",
    category: "Casual",
    price: 2000000,
    originalPrice: 2500000,
    discount: 20,
    rating: 4.8,
    description: "Iconic tennis-inspired sneakers",
    color: "White/Green",
    store: "Adidas Official",
    location: "Hanoi"
  },
  {
    name: "Nike Urban Street",
    brand: "Nike",
    category: "Casual",
    price: 2200000,
    originalPrice: 2800000,
    discount: 21,
    rating: 4.5,
    description: "Urban lifestyle sneakers",
    color: "Grey",
    store: "Nike Official Store",
    location: "Da Nang"
  },
  {
    name: "Nike Zoom Elite",
    brand: "Nike",
    category: "Running",
    price: 2900000,
    originalPrice: 3600000,
    discount: 19,
    rating: 4.7,
    description: "Professional running shoes",
    color: "Black/Orange",
    store: "Nike Official Store",
    location: "Hanoi"
  },
  {
    name: "Nike Air Max 2",
    brand: "Nike",
    category: "Running",
    price: 3100000,
    originalPrice: 3800000,
    discount: 18,
    rating: 4.6,
    description: "Advanced air cushioning",
    color: "Blue",
    store: "Nike Official Store",
    location: "Ho Chi Minh"
  },
  {
    name: "Adidas Boost 2",
    brand: "Adidas",
    category: "Running",
    price: 2700000,
    originalPrice: 3300000,
    discount: 18,
    rating: 4.5,
    description: "Enhanced boost comfort",
    color: "Black",
    store: "Adidas Official",
    location: "Hanoi"
  },
  {
    name: "Nike React Run 2",
    brand: "Nike",
    category: "Running",
    price: 2600000,
    originalPrice: 3100000,
    discount: 16,
    rating: 4.4,
    description: "Responsive foam technology",
    color: "White/Red",
    store: "Nike Official Store",
    location: "Da Nang"
  },
  {
    name: "Nike Urban Street 2",
    brand: "Nike",
    category: "Casual",
    price: 2300000,
    originalPrice: 2900000,
    discount: 21,
    rating: 4.6,
    description: "Modern street style",
    color: "Black",
    store: "Nike Official Store",
    location: "Ho Chi Minh"
  }
];

// ========== SEED DATABASE ==========
async function seedDatabase() {
  try {
    // 1. Đọc tất cả ảnh
    const imageDir = './temp-images';
    const files = fs.readdirSync(imageDir).filter(file => {
      return /\.(jpg|jpeg|png|webp)$/i.test(file);
    });
    
    console.log(`\n🔍 Tìm thấy ${files.length} ảnh`);
    console.log(`📦 Chuẩn bị tạo ${productTemplates.length} sản phẩm\n`);
    
    // 2. Xóa dữ liệu cũ (nếu có)
    await Product.deleteMany({});
    console.log('🗑️  Đã xóa dữ liệu cũ\n');
    
    // 3. Tạo sản phẩm với ảnh
    const products = [];
    
    for (let i = 0; i < productTemplates.length && i < files.length; i++) {
      const template = productTemplates[i];
      const imagePath = path.join(imageDir, files[i]);
      const base64 = imageToBase64(imagePath);
      
      if (base64) {
        const product = {
          ...template,
          image: base64,
          reviewCount: Math.floor(Math.random() * 500) + 50,
          reviews: Math.floor(Math.random() * 500) + 50,
          sold: Math.floor(Math.random() * 1000) + 100,
          stock: Math.floor(Math.random() * 150) + 50,
          featured: i < 6, // 6 sản phẩm đầu là featured
          condition: "New"
        };
        
        products.push(product);
        console.log(`✅ [${i + 1}/${productTemplates.length}] ${template.name} ← ${files[i]}`);
      }
    }
    
    // 4. Lưu vào MongoDB
    await Product.insertMany(products);
    
    console.log('\n🎉 HOÀN THÀNH!');
    console.log(`✅ Đã tạo ${products.length} sản phẩm với ảnh`);
    console.log(`📊 Database: sneaker_shop_db`);
    console.log(`📁 Collection: products`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi:', error);
    process.exit(1);
  }
}

seedDatabase();