# OTA 固件管理平台

一个专为 IoT 设备设计的 OTA (Over-The-Air) 固件管理平台，支持固件上传、下载、管理和自动化部署。

## ✨ 功能特性

- 🚀 **固件上传管理** - 支持拖拽上传 .bin 固件文件
- 📱 **响应式界面** - 美观的现代化 UI，支持手机端访问
- 🔗 **OTA 下载链接** - 自动生成固件下载链接，支持一键复制
- 🛡️ **安全保护** - 文件类型验证、大小限制、频率限制
- 📊 **固件管理** - 版本管理、上传时间、文件大小展示
- 🌐 **生产就绪** - 支持 PM2 和 systemd 部署

## 🏗️ 技术架构

### 后端技术栈
- **Node.js + Express** - RESTful API 服务
- **Multer** - 文件上传处理
- **Helmet** - 安全中间件
- **Rate Limiting** - API 频率限制

### 前端技术栈
- **React 18** - 现代化前端框架
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Lucide React** - 美观的图标库
- **React Dropzone** - 拖拽上传组件

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- Ubuntu 20.04+ (生产环境)

### 安装部署

#### 1. 克隆项目
```bash
git clone <your-repo-url>
cd ota-firmware-manager
```

#### 2. 安装依赖
```bash
# 安装所有依赖（根目录 + 前端 + 后端）
npm run install-all
```

#### 3. 配置环境变量
```bash
# 复制并编辑后端环境配置
cp backend/.env.example backend/.env
# 根据需要修改配置
```

#### 4. 开发模式运行
```bash
# 同时启动前后端开发服务器
npm run dev

# 或分别启动
npm run dev:backend  # 后端: http://localhost:8000
npm run dev:frontend # 前端: http://localhost:3000
```

#### 5. 生产模式部署
```bash
# 构建前端并准备生产环境
npm run build

# 启动生产服务器
npm start
```

## 🌐 生产环境部署

### 方法一：使用 PM2 (推荐)

#### 安装 PM2
```bash
sudo npm install -g pm2
```

#### 部署应用
```bash
# 构建并启动
npm run deploy

# 或手动操作
npm run build
pm2 start ecosystem.config.js

# PM2 管理命令
pm2 status          # 查看状态
pm2 restart ota-firmware  # 重启
pm2 stop ota-firmware     # 停止
pm2 logs ota-firmware     # 查看日志
```

#### 设置开机自启
```bash
pm2 startup ubuntu
pm2 save
```

### 方法二：使用 systemd

#### 创建服务文件
```bash
sudo nano /etc/systemd/system/ota-firmware.service
```

添加以下内容：
```ini
[Unit]
Description=OTA Firmware Management Platform
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/path/to/ota-firmware-manager
ExecStart=/usr/bin/node backend/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8000

[Install]
WantedBy=multi-user.target
```

#### 启动服务
```bash
sudo systemctl daemon-reload
sudo systemctl enable ota-firmware
sudo systemctl start ota-firmware
sudo systemctl status ota-firmware
```

### 方法三：使用 Nginx 反向代理

#### 安装 Nginx
```bash
sudo apt update
sudo apt install nginx
```

#### 配置反向代理
```bash
sudo nano /etc/nginx/sites-available/ota-firmware
```

添加配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 启用配置
```bash
sudo ln -s /etc/nginx/sites-available/ota-firmware /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 📝 API 接口

### 获取固件列表
```http
GET /api/firmwares
```

### 上传固件
```http
POST /api/upload
Content-Type: multipart/form-data

{
  "firmware": <.bin文件>,
  "version": "v1.0.0"
}
```

### 删除固件
```http
DELETE /api/delete/:filename
```

### 下载固件
```http
GET /firmwares/:filename
```

### 健康检查
```http
GET /api/health
```

## 🔧 配置说明

### 环境变量 (.env)
```bash
PORT=8000                    # 服务端口
NODE_ENV=production          # 运行环境
UPLOAD_DIR=uploads          # 上传目录
MAX_FILE_SIZE=50MB          # 最大文件大小
ALLOWED_EXTENSIONS=.bin     # 允许的文件扩展名
```

### 安全配置
- 文件类型限制：仅允许 .bin 格式
- 文件大小限制：最大 50MB
- API 频率限制：每15分钟100次请求
- 上传频率限制：每分钟5次上传

## 🎯 使用方法

### 1. 上传固件
1. 访问平台首页
2. 在上传区域拖拽或点击选择 .bin 文件
3. 输入版本号（如：v1.0.0）
4. 点击"开始上传"

### 2. 管理固件
- **查看列表**：所有固件按时间倒序显示
- **复制链接**：点击复制按钮获取 OTA 下载链接
- **下载固件**：点击下载按钮直接下载文件
- **删除固件**：点击删除按钮移除文件

### 3. OTA 下载链接格式
```
http://your-server-ip:8000/firmwares/filename.bin
```

## 🛠️ 开发指南

### 项目结构
```
ota-firmware-manager/
├── backend/                 # 后端代码
│   ├── routes/             # API 路由
│   ├── utils/              # 工具函数
│   ├── uploads/            # 固件上传目录
│   ├── server.js           # 服务器入口
│   └── package.json        # 后端依赖
├── frontend/               # 前端代码
│   ├── src/                # 源代码
│   │   ├── components/     # React 组件
│   │   ├── App.jsx         # 主应用组件
│   │   └── main.jsx        # 入口文件
│   ├── dist/               # 构建产物
│   └── package.json        # 前端依赖
├── logs/                   # PM2 日志目录
├── ecosystem.config.js     # PM2 配置
├── package.json            # 根目录依赖
└── README.md              # 项目文档
```

### 开发命令
```bash
npm run install-all    # 安装所有依赖
npm run dev            # 开发模式（前后端同时启动）
npm run dev:backend    # 仅启动后端开发服务器
npm run dev:frontend   # 仅启动前端开发服务器
npm run build          # 构建生产版本
npm start              # 启动生产服务器
npm run deploy         # 构建并使用 PM2 部署
```

## 🐛 故障排除

### 常见问题

1. **上传失败**
   - 检查文件格式是否为 .bin
   - 确认文件大小是否超过 50MB
   - 查看网络连接是否正常

2. **服务启动失败**
   - 检查端口 8000 是否被占用
   - 确认 Node.js 版本是否 >= 16.0.0
   - 查看 logs/ 目录下的错误日志

3. **前端页面无法访问**
   - 确认是否已运行 `npm run build`
   - 检查 backend/server.js 是否正常启动
   - 查看防火墙设置

### 日志查看
```bash
# PM2 日志
pm2 logs ota-firmware

# systemd 日志
sudo journalctl -u ota-firmware -f

# 手动查看
tail -f logs/combined.log
```

## 📞 技术支持

如果遇到问题或需要技术支持，请：

1. 查看本文档的故障排除部分
2. 检查项目 Issues
3. 提供详细的错误日志和环境信息

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**注意**：本平台主要用于内网或受信任环境中的固件管理。如需在公网部署，请额外考虑身份验证、HTTPS 加密等安全措施。 