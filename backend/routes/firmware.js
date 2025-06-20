const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const uploadsPath = path.join(__dirname, '..', UPLOAD_DIR);

// Multer 配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    // 生成文件名：版本号_时间戳.bin
    const timestamp = Date.now();
    const version = req.body.version || 'v1.0.0';
    const sanitizedVersion = version.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${sanitizedVersion}_${timestamp}.bin`;
    cb(null, filename);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() === '.bin') {
    cb(null, true);
  } else {
    cb(new Error('仅支持 .bin 格式的固件文件'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1
  }
});

// 获取服务器IP地址
function getServerInfo(req) {
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  const host = req.get('host');
  return `${protocol}://${host}`;
}

// 获取文件信息
function getFileInfo(filename, baseUrl) {
  const filePath = path.join(uploadsPath, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const stats = fs.statSync(filePath);
  const parts = filename.replace('.bin', '').split('_');
  const timestamp = parts[parts.length - 1];
  const version = parts.slice(0, -1).join('_') || 'unknown';
  
  return {
    filename,
    version,
    size: stats.size,
    sizeFormatted: formatFileSize(stats.size),
    uploadTime: new Date(parseInt(timestamp)).toLocaleString('zh-CN'),
    downloadUrl: `${baseUrl}/firmwares/${filename}`
  };
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// API 路由

// 获取所有固件列表
router.get('/firmwares', (req, res) => {
  try {
    if (!fs.existsSync(uploadsPath)) {
      return res.json({
        success: true,
        data: [],
        message: '上传目录不存在'
      });
    }

    const files = fs.readdirSync(uploadsPath)
      .filter(file => file.endsWith('.bin'))
      .map(filename => getFileInfo(filename, getServerInfo(req)))
      .filter(file => file !== null)
      .sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));

    res.json({
      success: true,
      data: files,
      total: files.length,
      message: `找到 ${files.length} 个固件文件`
    });
  } catch (error) {
    console.error('获取固件列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取固件列表失败',
      message: error.message
    });
  }
});

// 上传固件
router.post('/upload', upload.single('firmware'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '未选择文件或文件格式不正确',
        message: '请选择 .bin 格式的固件文件'
      });
    }

    const fileInfo = getFileInfo(req.file.filename, getServerInfo(req));
    
    res.json({
      success: true,
      data: fileInfo,
      message: '固件上传成功！'
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({
      success: false,
      error: '固件上传失败',
      message: error.message
    });
  }
});

// 删除固件
router.delete('/delete/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    // 安全检查：确保文件名只包含安全字符
    if (!/^[a-zA-Z0-9._-]+\.bin$/.test(filename)) {
      return res.status(400).json({
        success: false,
        error: '无效的文件名格式'
      });
    }

    const filePath = path.join(uploadsPath, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: '文件不存在',
        filename
      });
    }

    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: '固件删除成功',
      filename
    });
  } catch (error) {
    console.error('删除失败:', error);
    res.status(500).json({
      success: false,
      error: '固件删除失败',
      message: error.message
    });
  }
});

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'OTA 固件管理平台运行正常',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    server: getServerInfo(req)
  });
});

module.exports = router; 