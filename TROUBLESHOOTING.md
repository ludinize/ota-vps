# 🔧 OTA 固件管理平台 - 故障排查指南

## 🚨 上传问题排查

### 快速解决方案

如果遇到上传问题，请按以下顺序执行：

```bash
# 1. 快速修复（推荐）
bash fix_upload.sh

# 2. 如果仍有问题，运行诊断
bash debug_upload.sh

# 3. 测试上传功能
bash test_upload.sh
```

---

## 📋 常见问题及解决方案

### 1. 上传按钮无响应或上传失败

**可能原因：**
- 前端构建问题
- API 路由配置错误
- 文件权限问题

**解决方案：**
```bash
# 重新构建前端
cd frontend && npm run build && cd ..

# 检查上传目录权限
mkdir -p backend/uploads
chmod 755 backend/uploads

# 重启服务
pm2 restart ota-firmware
```

### 2. "文件上传失败" 错误

**可能原因：**
- 文件格式不正确（非 .bin 文件）
- 文件大小超过限制（>50MB）
- 上传目录权限不足

**解决方案：**
```bash
# 检查文件格式
file your-firmware.bin  # 应该显示文件信息

# 检查文件大小
ls -lh your-firmware.bin  # 应该 < 50MB

# 修复权限
sudo chown -R $USER:$USER backend/uploads
chmod 755 backend/uploads
```

### 3. "网络错误" 或无法连接到服务器

**可能原因：**
- 服务未启动
- 端口被防火墙阻挡
- 代理配置错误

**解决方案：**
```bash
# 检查服务状态
pm2 status

# 检查端口占用
sudo lsof -i :8000

# 检查防火墙
sudo ufw status
sudo ufw allow 8000/tcp

# 重启服务
pm2 restart ota-firmware
```

### 4. 上传成功但文件列表为空

**可能原因：**
- 文件保存路径错误
- 数据库同步问题
- 文件权限问题

**解决方案：**
```bash
# 检查上传目录
ls -la backend/uploads/

# 检查文件权限
chmod 644 backend/uploads/*.bin

# 重新获取列表
curl http://localhost:8000/api/firmwares
```

### 5. 前端页面显示 "前端文件未找到"

**可能原因：**
- 前端未构建
- 构建路径错误

**解决方案：**
```bash
# 重新构建前端
cd frontend
rm -rf dist node_modules
npm install
npm run build
cd ..

# 重启服务
pm2 restart ota-firmware
```

---

## 🔍 详细诊断步骤

### 步骤 1: 检查服务状态

```bash
# 检查 PM2 状态
pm2 status

# 查看详细日志
pm2 logs ota-firmware --lines 50

# 检查进程
ps aux | grep node
```

### 步骤 2: 测试 API 接口

```bash
# 测试健康检查
curl http://localhost:8000/api/health

# 测试获取固件列表
curl http://localhost:8000/api/firmwares

# 测试上传（如果有测试文件）
curl -F "firmware=@test.bin" -F "version=test" http://localhost:8000/api/upload
```

### 步骤 3: 检查文件系统

```bash
# 检查目录结构
tree . -L 3

# 检查权限
ls -la backend/
ls -la backend/uploads/
ls -la frontend/dist/

# 检查磁盘空间
df -h
```

### 步骤 4: 检查网络

```bash
# 检查端口监听
netstat -tulpn | grep 8000

# 测试本地连接
telnet localhost 8000

# 检查防火墙
sudo ufw status verbose
```

---

## 📝 日志分析

### PM2 日志

```bash
# 查看所有日志
pm2 logs ota-firmware

# 仅查看错误日志
pm2 logs ota-firmware --err

# 实时查看日志
pm2 logs ota-firmware --follow
```

### 系统日志

```bash
# 查看系统日志
sudo journalctl -u ota-firmware -f

# 查看 nginx 日志（如果使用）
sudo tail -f /var/log/nginx/error.log
```

---

## 🛠️ 高级故障排除

### 完全重置和重新部署

如果所有方法都无效，可以执行完全重置：

```bash
# 1. 停止所有服务
pm2 delete ota-firmware

# 2. 清理文件
rm -rf backend/uploads/*
rm -rf frontend/dist
rm -rf frontend/node_modules
rm -rf backend/node_modules
rm -rf logs/*

# 3. 重新安装依赖
npm run install-all

# 4. 重新构建
npm run build

# 5. 重新启动
pm2 start ecosystem.config.js

# 6. 测试
bash test_upload.sh
```

### 调试模式运行

```bash
# 停止 PM2 服务
pm2 stop ota-firmware

# 直接运行后端（可以看到详细错误）
cd backend && NODE_ENV=development node server.js

# 在另一个终端测试上传
curl -F "firmware=@test.bin" -F "version=test" http://localhost:8000/api/upload
```

---

## 🔒 权限问题解决

### 设置正确的文件权限

```bash
# 设置项目目录权限
sudo chown -R $USER:$USER .
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# 设置可执行脚本权限
chmod +x *.sh

# 设置上传目录权限
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### SELinux 问题（CentOS/RHEL）

```bash
# 检查 SELinux 状态
sestatus

# 临时禁用 SELinux（测试用）
sudo setenforce 0

# 永久禁用（编辑 /etc/selinux/config）
sudo sed -i 's/SELINUX=enforcing/SELINUX=disabled/' /etc/selinux/config
```

---

## 📞 获取帮助

### 收集诊断信息

运行以下命令收集完整的诊断信息：

```bash
# 运行诊断脚本
bash debug_upload.sh > diagnosis.log 2>&1

# 收集系统信息
echo "=== 系统信息 ===" >> diagnosis.log
uname -a >> diagnosis.log
node -v >> diagnosis.log
npm -v >> diagnosis.log

# 收集服务信息
echo "=== 服务信息 ===" >> diagnosis.log
pm2 status >> diagnosis.log
pm2 logs ota-firmware --lines 20 >> diagnosis.log

# 发送诊断信息
cat diagnosis.log
```

### 常见错误代码

- **400 Bad Request**: 文件格式错误或参数缺失
- **413 Payload Too Large**: 文件大小超过限制
- **500 Internal Server Error**: 服务器内部错误，检查日志
- **EACCES**: 权限不足
- **ENOENT**: 文件或目录不存在
- **EADDRINUSE**: 端口已被占用

---

## ✅ 验证修复

修复问题后，请运行以下测试确认功能正常：

```bash
# 1. 服务健康检查
curl http://localhost:8000/api/health

# 2. 前端页面访问
curl -I http://localhost:8000

# 3. 上传功能测试
bash test_upload.sh

# 4. 手动测试
# 访问 http://your-server-ip:8000
# 尝试上传一个小的 .bin 文件
# 检查是否出现在固件列表中
```

如果所有测试通过，说明问题已解决！ 