#!/bin/bash

# OTA 固件上传功能测试脚本

echo "🧪 测试 OTA 固件上传功能..."

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# 检查服务是否运行
check_service() {
    print_info "检查服务状态..."
    
    # 测试健康检查接口
    if command -v curl &> /dev/null; then
        RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health_check http://localhost:8000/api/health)
        if [ "$RESPONSE" = "200" ]; then
            print_success "服务运行正常"
            return 0
        else
            print_error "服务异常，HTTP状态码: $RESPONSE"
            return 1
        fi
    else
        print_error "curl 未安装，无法测试"
        return 1
    fi
}

# 创建测试文件
create_test_file() {
    print_info "创建测试固件文件..."
    
    # 创建一个小的测试文件（模拟 .bin 文件）
    echo "This is a test firmware file for OTA upload testing" > test_firmware.bin
    echo "$(date)" >> test_firmware.bin
    echo "Version: test-v1.0.0" >> test_firmware.bin
    
    if [ -f "test_firmware.bin" ]; then
        print_success "测试文件创建成功: test_firmware.bin"
        ls -la test_firmware.bin
        return 0
    else
        print_error "测试文件创建失败"
        return 1
    fi
}

# 测试上传功能
test_upload() {
    print_info "测试文件上传..."
    
    if [ ! -f "test_firmware.bin" ]; then
        print_error "测试文件不存在"
        return 1
    fi
    
    # 使用 curl 测试上传
    UPLOAD_RESPONSE=$(curl -s -w "%{http_code}" \
        -F "firmware=@test_firmware.bin" \
        -F "version=test-v1.0.0" \
        -o /tmp/upload_response \
        http://localhost:8000/api/upload)
    
    echo ""
    print_info "上传响应状态码: $UPLOAD_RESPONSE"
    
    if [ "$UPLOAD_RESPONSE" = "200" ]; then
        print_success "文件上传成功！"
        echo "响应内容:"
        cat /tmp/upload_response | jq . 2>/dev/null || cat /tmp/upload_response
        return 0
    else
        print_error "文件上传失败"
        echo "错误响应:"
        cat /tmp/upload_response
        return 1
    fi
}

# 测试文件列表
test_list() {
    print_info "测试固件列表..."
    
    LIST_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/list_response http://localhost:8000/api/firmwares)
    
    if [ "$LIST_RESPONSE" = "200" ]; then
        print_success "获取固件列表成功"
        echo "固件列表:"
        cat /tmp/list_response | jq . 2>/dev/null || cat /tmp/list_response
        return 0
    else
        print_error "获取固件列表失败，状态码: $LIST_RESPONSE"
        return 1
    fi
}

# 清理测试文件
cleanup() {
    print_info "清理测试文件..."
    
    rm -f test_firmware.bin
    rm -f /tmp/health_check /tmp/upload_response /tmp/list_response
    
    # 删除上传的测试文件
    if [ -d "backend/uploads" ]; then
        find backend/uploads -name "*test-v1.0.0*" -delete 2>/dev/null
    fi
    
    print_success "清理完成"
}

# 主测试流程
main() {
    echo ""
    
    # 检查服务
    if ! check_service; then
        print_error "服务未运行，请先启动服务"
        echo "启动命令: pm2 start ecosystem.config.js"
        exit 1
    fi
    
    echo ""
    
    # 创建测试文件
    if ! create_test_file; then
        exit 1
    fi
    
    echo ""
    
    # 测试上传
    if test_upload; then
        echo ""
        # 测试列表
        test_list
    fi
    
    echo ""
    
    # 清理
    cleanup
    
    echo ""
    print_success "🎉 测试完成！"
}

# 检查依赖
if ! command -v curl &> /dev/null; then
    print_error "curl 未安装，请先安装 curl"
    echo "安装命令: sudo apt update && sudo apt install curl"
    exit 1
fi

# 运行测试
main 