const fs = require('fs');
const path = require('path');

// 创建上传目录
function createUploadsDir() {
  const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 创建上传目录: ${uploadDir}`);
  }
  
  return uploadDir;
}

// 设置其他中间件
function setupMiddleware(app) {
  // 这里可以添加其他全局中间件
  console.log('⚙️ 中间件设置完成');
}

module.exports = {
  createUploadsDir,
  setupMiddleware
}; 