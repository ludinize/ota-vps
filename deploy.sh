#!/bin/bash

# OTA 固件管理平台自动部署脚本
# 支持 Ubuntu 20.04+

set -e

echo "🚀 开始部署 OTA 固件管理平台..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 检查系统要求
check_requirements() {
    print_info "检查系统要求..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js 16+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | sed 's/v//')
    if ! node -e "process.exit(process.version.split('.')[0] >= 16 ? 0 : 1)"; then
        print_error "Node.js 版本过低，当前版本: $NODE_VERSION，需要 16+"
        exit 1
    fi
    print_success "Node.js 版本检查通过: $NODE_VERSION"
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装"
        exit 1
    fi
    print_success "npm 版本: $(npm -v)"
}

# 安装依赖
install_dependencies() {
    print_info "安装项目依赖..."
    
    # 安装根目录依赖
    print_info "安装根目录依赖..."
    npm install
    
    # 安装后端依赖
    print_info "安装后端依赖..."
    cd backend && npm install && cd ..
    
    # 安装前端依赖
    print_info "安装前端依赖..."
    cd frontend && npm install && cd ..
    
    print_success "依赖安装完成"
}

# 构建项目
build_project() {
    print_info "构建前端项目..."
    cd frontend && npm run build && cd ..
    print_success "前端构建完成"
}

# 配置环境变量
setup_environment() {
    print_info "配置环境变量..."
    
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_warning "请编辑 backend/.env 文件配置环境变量"
    else
        print_success "环境变量文件已存在"
    fi
    
    # 创建必要的目录
    mkdir -p backend/uploads
    mkdir -p logs
    print_success "目录创建完成"
}

# 安装 PM2
install_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_info "安装 PM2..."
        sudo npm install -g pm2
        print_success "PM2 安装完成"
    else
        print_success "PM2 已安装: $(pm2 -v)"
    fi
}

# 部署应用
deploy_application() {
    print_info "部署应用..."
    
    # 停止现有进程（如果存在）
    pm2 delete ota-firmware 2>/dev/null || true
    
    # 启动应用
    pm2 start ecosystem.config.js
    
    # 保存 PM2 配置
    pm2 save
    
    print_success "应用部署完成"
    
    # 显示状态
    pm2 status
}

# 设置开机自启
setup_startup() {
    print_info "设置开机自启..."
    
    # 生成启动脚本
    pm2 startup ubuntu -u $USER --hp $HOME | grep -v "PM2" | sudo bash
    
    print_success "开机自启设置完成"
}

# 配置防火墙
setup_firewall() {
    if command -v ufw &> /dev/null; then
        print_info "配置防火墙..."
        sudo ufw allow 8000/tcp
        print_success "防火墙配置完成 (允许端口 8000)"
    else
        print_warning "ufw 未安装，请手动配置防火墙允许端口 8000"
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    print_success "🎉 OTA 固件管理平台部署完成！"
    echo ""
    echo "📡 访问地址: http://$(hostname -I | awk '{print $1}'):8000"
    echo "🔧 管理命令:"
    echo "   pm2 status          # 查看状态"
    echo "   pm2 restart ota-firmware  # 重启服务"
    echo "   pm2 logs ota-firmware     # 查看日志"
    echo "   pm2 stop ota-firmware     # 停止服务"
    echo ""
    echo "📁 文件位置:"
    echo "   配置文件: $(pwd)/backend/.env"
    echo "   上传目录: $(pwd)/backend/uploads"
    echo "   日志目录: $(pwd)/logs"
    echo ""
}

# 主要部署流程
main() {
    check_requirements
    install_dependencies
    build_project
    setup_environment
    install_pm2
    deploy_application
    setup_startup
    setup_firewall
    show_deployment_info
}

# 错误处理
trap 'print_error "部署过程中发生错误，请检查上述输出"; exit 1' ERR

# 执行主流程
main

print_success "✨ 部署脚本执行完成！" 