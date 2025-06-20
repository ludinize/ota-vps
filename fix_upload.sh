#!/bin/bash

# OTA 固件上传问题快速修复脚本

echo "🔧 开始修复上传问题..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# 1. 创建并设置上传目录权限
print_info "1. 修复上传目录权限..."
mkdir -p backend/uploads
chmod 755 backend/uploads
chown $USER:$USER backend/uploads
print_success "上传目录权限已修复"

# 2. 创建日志目录
print_info "2. 创建日志目录..."
mkdir -p logs
chmod 755 logs
print_success "日志目录已创建"

# 3. 检查并创建环境变量文件
print_info "3. 检查环境变量配置..."
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << 'EOF'
PORT=8000
NODE_ENV=production
UPLOAD_DIR=uploads
MAX_FILE_SIZE=50MB
ALLOWED_EXTENSIONS=.bin
EOF
    print_success "环境变量文件已创建"
else
    print_success "环境变量文件已存在"
fi

# 4. 重新构建前端
print_info "4. 重新构建前端..."
cd frontend
if [ -d "node_modules" ]; then
    npm run build
    print_success "前端重新构建完成"
else
    print_warning "前端依赖未安装，正在安装..."
    npm install
    npm run build
    print_success "前端安装和构建完成"
fi
cd ..

# 5. 检查后端依赖
print_info "5. 检查后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    print_warning "后端依赖未安装，正在安装..."
    npm install
    print_success "后端依赖安装完成"
else
    print_success "后端依赖已存在"
fi
cd ..

# 6. 重启服务
print_info "6. 重启服务..."
if command -v pm2 &> /dev/null; then
    pm2 restart ota-firmware 2>/dev/null || pm2 start ecosystem.config.js
    print_success "PM2 服务已重启"
    
    # 显示状态
    echo ""
    pm2 status
    
    # 显示最新日志
    echo ""
    print_info "最新日志："
    pm2 logs ota-firmware --lines 5
else
    print_warning "PM2 未安装，无法重启服务"
fi

echo ""
print_success "✨ 修复完成！"
echo ""
print_info "测试步骤："
echo "1. 访问: http://your-server-ip:8000"
echo "2. 尝试上传一个小的 .bin 文件测试"
echo "3. 查看是否出现在固件列表中"
echo ""
print_info "如果仍有问题，请运行诊断脚本："
echo "bash debug_upload.sh" 