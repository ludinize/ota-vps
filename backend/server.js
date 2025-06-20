const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const firmwareRoutes = require('./routes/firmware');
const { createUploadsDir, setupMiddleware } = require('./utils/setup');

const app = express();
const PORT = process.env.PORT || 8000;

// 创建上传目录
createUploadsDir();

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 限制每个IP 100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  }
});
app.use(limiter);

// 上传限制（更严格）
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 5, // 每分钟最多5次上传
  message: {
    error: '上传过于频繁，请稍后再试'
  }
});

// 基础中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 上传路由（带限制）
app.use('/api/upload', uploadLimiter);

// API 路由
app.use('/api', firmwareRoutes);

// 静态文件服务 - 前端构建文件
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

// 固件文件下载路由
app.use('/firmwares', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// 前端路由处理 (SPA)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: '前端文件未找到，请先运行 npm run build' 
    });
  }
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: '文件大小超出限制',
      maxSize: process.env.MAX_FILE_SIZE || '50MB'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: '不支持的文件类型，仅支持 .bin 格式'
    });
  }
  
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请联系管理员'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.path
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 OTA 固件管理平台启动成功！`);
  console.log(`📡 服务器地址: http://localhost:${PORT}`);
  console.log(`📁 上传目录: ${path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')}`);
  console.log(`🔒 环境模式: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; 