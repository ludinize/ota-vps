#!/bin/bash

# OTA 固件上传问题诊断脚本

echo "🔍 开始诊断上传问题..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo ""
print_info "=== 1. 检查服务状态 ==="

# 检查服务是否运行
if command -v pm2 &> /dev/null; then
    echo "PM2 状态:"
    pm2 status | grep ota-firmware || print_warning "PM2 中未找到 ota-firmware 进程"
fi

# 检查端口占用
echo ""
print_info "检查端口 8000 占用情况:"
if command -v lsof &> /dev/null; then
    lsof -i :8000 || print_warning "端口 8000 未被占用"
elif command -v netstat &> /dev/null; then
    netstat -tulpn | grep 8000 || print_warning "端口 8000 未被占用"
else
    print_warning "无法检查端口占用 (lsof 和 netstat 都不可用)"
fi

echo ""
print_info "=== 2. 检查文件和目录权限 ==="

# 检查上传目录
UPLOAD_DIR="backend/uploads"
if [ -d "$UPLOAD_DIR" ]; then
    print_success "上传目录存在: $UPLOAD_DIR"
    ls -la "$UPLOAD_DIR"
    
    # 检查写权限
    if [ -w "$UPLOAD_DIR" ]; then
        print_success "上传目录有写权限"
    else
        print_error "上传目录无写权限！"
        echo "修复命令: chmod 755 $UPLOAD_DIR"
    fi
else
    print_error "上传目录不存在: $UPLOAD_DIR"
    echo "创建命令: mkdir -p $UPLOAD_DIR"
fi

echo ""
print_info "=== 3. 检查前端构建 ==="

# 检查前端构建文件
FRONTEND_DIST="frontend/dist"
if [ -d "$FRONTEND_DIST" ]; then
    print_success "前端构建目录存在"
    echo "构建文件:"
    ls -la "$FRONTEND_DIST" | head -10
else
    print_error "前端构建目录不存在！"
    echo "构建命令: cd frontend && npm run build"
fi

echo ""
print_info "=== 4. 测试 API 接口 ==="

# 测试健康检查接口
echo "测试健康检查接口..."
if command -v curl &> /dev/null; then
    HEALTH_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8000/api/health -o /tmp/health_response)
    if [ "$HEALTH_RESPONSE" = "200" ]; then
        print_success "健康检查接口正常"
        cat /tmp/health_response
    else
        print_error "健康检查接口异常，HTTP 状态码: $HEALTH_RESPONSE"
    fi
    rm -f /tmp/health_response
else
    print_warning "curl 不可用，无法测试 API"
fi

echo ""
print_info "=== 5. 检查日志 ==="

# 检查 PM2 日志
if command -v pm2 &> /dev/null; then
    echo "最近的 PM2 错误日志:"
    pm2 logs ota-firmware --lines 10 --err 2>/dev/null || print_warning "无法获取 PM2 日志"
fi

# 检查系统日志
echo ""
echo "检查系统日志中的相关错误:"
if [ -f "/var/log/syslog" ]; then
    tail -20 /var/log/syslog | grep -i "ota\|node\|npm" || print_info "系统日志中无相关错误"
fi

echo ""
print_info "=== 6. 检查磁盘空间 ==="
df -h . | head -2

echo ""
print_info "=== 7. 检查环境变量 ==="
if [ -f "backend/.env" ]; then
    print_success "环境变量文件存在"
    echo "当前配置:"
    cat backend/.env
else
    print_warning "环境变量文件不存在"
fi

echo ""
print_info "=== 8. 网络连通性测试 ==="

# 测试从外部访问
echo "本机IP地址:"
if command -v ip &> /dev/null; then
    ip route get 1 | awk '{print $7}' | head -1
elif command -v hostname &> /dev/null; then
    hostname -I | awk '{print $1}'
else
    print_warning "无法获取IP地址"
fi

echo ""
print_info "=== 诊断完成 ==="
echo ""
print_info "常见问题修复命令:"
echo "1. 重新创建上传目录: mkdir -p backend/uploads && chmod 755 backend/uploads"
echo "2. 重新构建前端: cd frontend && npm run build"  
echo "3. 重启服务: pm2 restart ota-firmware"
echo "4. 查看详细日志: pm2 logs ota-firmware --lines 50"
echo "5. 检查防火墙: sudo ufw status"
echo "" 