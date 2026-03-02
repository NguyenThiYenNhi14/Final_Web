const mongoose = require('mongoose');
const Product = require('./models/product');
const fs = require('fs');
const path = require('path');

mongoose.connect('mongodb://localhost:27017/sneaker_shop_db')
  .then(() => console.log('✅ Connected to MongoDB'));

// ========== HÀM CONVERT ẢNH SANG BASE64 ==========
function imageToBase64(imagePath) {
  try {
    // Đọc file ảnh
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Xác định loại ảnh (jpg, png...)
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif'
    };
    
    const mimeType = mimeTypes[ext] || 'image/jpeg';
    
    // Convert sang Base64
    const base64 = imageBuffer.toString('base64');
    
    // Tạo chuỗi Base64 hoàn chỉnh
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('❌ Error converting:', error.message);
    return null;
  }
}

// ========== HÀM CẬP NHẬT HÀNG LOẠT ==========
async function batchUpdateImages() {
  try {
    // 1. Đọc tất cả file ảnh trong thư mục temp-images
    const imageDir = './temp-images';
    const files = fs.readdirSync(imageDir).filter(file => {
      return /\.(jpg|jpeg|png|webp|gif)$/i.test(file);
    });
    
    console.log(`\n🔍 Tìm thấy ${files.length} ảnh trong thư mục temp-images/`);
    console.log('📸 Danh sách ảnh:');
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    
    if (files.length === 0) {
      console.log('\n❌ Không có ảnh nào! Hãy copy ảnh vào thư mục temp-images/');
      process.exit(1);
    }
    
    // 2. Lấy tất cả sản phẩm từ MongoDB
    const products = await Product.find({});
    console.log(`\n📦 Tìm thấy ${products.length} sản phẩm trong database`);
    
    // 3. Cập nhật ảnh cho từng sản phẩm
    console.log('\n🚀 Bắt đầu cập nhật...\n');
    
    for (let i = 0; i < Math.min(files.length, products.length); i++) {
      const imagePath = path.join(imageDir, files[i]);
      const base64 = imageToBase64(imagePath);
      
      if (base64) {
        await Product.updateOne(
          { _id: products[i]._id },
          { $set: { image: base64 } }
        );
        
        console.log(`✅ [${i + 1}/${files.length}] ${products[i].name}`);
        console.log(`   → Ảnh: ${files[i]}`);
      } else {
        console.log(`❌ [${i + 1}/${files.length}] Lỗi convert: ${files[i]}`);
      }
    }
    
    console.log('\n🎉 HOÀN THÀNH!');
    console.log(`✅ Đã cập nhật ${Math.min(files.length, products.length)} sản phẩm`);
    
    if (files.length > products.length) {
      console.log(`⚠️  Còn ${files.length - products.length} ảnh thừa (không đủ sản phẩm)`);
    } else if (products.length > files.length) {
      console.log(`⚠️  Còn ${products.length - files.length} sản phẩm chưa có ảnh`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi:', error);
    process.exit(1);
  }
}

// ========== CHẠY ==========
batchUpdateImages();