# 🚀 OTA 固件管理平台 - 快速开始

## 一键部署（推荐）

### 在 Ubuntu VPS 上部署

```bash
# 1. 克隆或上传项目到服务器
git clone <your-repo> ota-firmware-manager
cd ota-firmware-manager

# 2. 运行自动部署脚本
sudo bash deploy.sh
```

脚本会自动完成：
- ✅ 检查系统环境（Node.js 16+）
- ✅ 安装所有依赖
- ✅ 构建前端项目
- ✅ 配置环境变量
- ✅ 安装并配置 PM2
- ✅ 启动服务
- ✅ 设置开机自启
- ✅ 配置防火墙

## 手动部署

### 1. 环境准备
```bash
# 安装 Node.js 16+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证版本
node -v  # 应该 >= 16.0.0
npm -v   # 应该 >= 8.0.0
```

### 2. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装后端依赖  
cd backend && npm install && cd ..

# 安装前端依赖
cd frontend && npm install && cd ..
```

### 3. 环境配置
```bash
# 复制环境变量文件
cp backend/.env.example backend/.env

# 编辑配置（可选）
nano backend/.env
```

### 4. 构建项目
```bash
# 构建前端
cd frontend && npm run build && cd ..
```

### 5. 启动服务

#### 方法一：开发模式
```bash
npm run dev  # 前后端同时启动，用于开发测试
```

#### 方法二：生产模式 + PM2
```bash
# 安装 PM2
sudo npm install -g pm2

# 启动服务
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 保存配置并设置开机自启
pm2 save
pm2 startup ubuntu
```

#### 方法三：systemd 服务
```bash
# 复制服务配置文件
sudo cp systemd.service /etc/systemd/system/ota-firmware.service

# 修改配置中的路径
sudo nano /etc/systemd/system/ota-firmware.service

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable ota-firmware
sudo systemctl start ota-firmware
```

## 🎯 访问应用

部署完成后，访问：
```
http://your-server-ip:8000
```

## 🔧 常用管理命令

### PM2 管理
```bash
pm2 status                # 查看服务状态
pm2 restart ota-firmware  # 重启服务
pm2 stop ota-firmware     # 停止服务
pm2 logs ota-firmware     # 查看日志
pm2 monit                 # 实时监控
```

### systemd 管理
```bash
sudo systemctl status ota-firmware    # 查看状态
sudo systemctl restart ota-firmware   # 重启服务
sudo systemctl stop ota-firmware      # 停止服务
sudo journalctl -u ota-firmware -f    # 查看日志
```

## 🌐 配置 Nginx（可选）

如果需要使用域名或 80 端口访问：

```bash
# 安装 Nginx
sudo apt update && sudo apt install nginx

# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/ota-firmware

# 修改域名配置
sudo nano /etc/nginx/sites-available/ota-firmware

# 启用网站
sudo ln -s /etc/nginx/sites-available/ota-firmware /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🛠️ 故障排除

### 端口被占用
```bash
# 查看占用端口 8000 的进程
sudo lsof -i :8000

# 杀死进程
sudo kill -9 <PID>
```

### 权限问题
```bash
# 确保用户有权限访问项目目录
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### 前端构建失败
```bash
# 清理并重新安装
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 查看详细日志
```bash
# PM2 日志
pm2 logs ota-firmware --lines 50

# 或查看文件日志
tail -f logs/combined.log
```

## 📱 功能测试

1. **上传固件**：拖拽 .bin 文件到上传区
2. **管理固件**：查看列表、复制 OTA 链接
3. **下载测试**：点击下载按钮测试
4. **API 测试**：访问 http://your-ip:8000/api/health

## 🔐 安全建议

- 使用防火墙限制访问
- 配置 HTTPS（生产环境）
- 定期备份上传的固件文件
- 监控服务器资源使用情况

## 📞 获取帮助

如果遇到问题：
1. 查看日志文件
2. 检查网络连接和防火墙
3. 确认 Node.js 版本
4. 参考 README.md 详细文档 