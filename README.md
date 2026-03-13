# 游戏测评网站

一个基于Node.js、Express和MongoDB的游戏测评网站，支持用户注册登录、游戏管理、评论管理等功能。

## 功能特性

- 游戏库浏览和搜索
- 游戏详情和评论系统
- 用户注册和登录（管理员/普通用户）
- 管理员后台管理（游戏和评论的CRUD操作）
- 文件上传功能
- 响应式设计

## 技术栈

- **前端**：HTML5, CSS3, JavaScript
- **后端**：Node.js, Express
- **数据库**：MongoDB
- **认证**：JWT
- **文件上传**：Multer

## 部署到Railway

### 步骤 1：准备工作

1. 确保你有一个Railway账户
2. 确保你有一个MongoDB数据库（可以使用Railway的MongoDB服务）
3. 将项目推送到GitHub仓库

### 步骤 2：部署到Railway

1. 登录Railway控制台
2. 点击「New Project」→「Deploy from GitHub」
3. 选择你的GitHub仓库
4. 配置环境变量：
   - `MONGO_URI`：MongoDB连接字符串
   - `JWT_SECRET`：JWT密钥

### 步骤 3：配置MongoDB

1. 在Railway中添加MongoDB服务
2. 获取MongoDB连接字符串
3. 在环境变量中设置`MONGO_URI`

### 步骤 4：启动服务

Railway会自动构建和部署你的项目。部署完成后，你可以通过Railway提供的URL访问你的网站。

## 本地开发

1. 克隆仓库
2. 安装依赖：`npm install`
3. 创建`.env`文件，设置环境变量
4. 启动开发服务器：`npm run dev`

## 管理员账户

系统会自动创建一个管理员账户：
- 邮箱：admin@example.com
- 密码：admin123

## 项目结构

```
├── backend/          # 后端代码
│   ├── config/       # 配置文件
│   ├── models/       # 数据模型
│   ├── routes/       # API路由
│   ├── server.js     # 服务器入口
│   └── package.json  # 依赖配置
├── html/             # 前端HTML文件
├── css/              # 样式文件
├── js/               # JavaScript文件
├── images/           # 图片文件
├── railway.json      # Railway部署配置
└── .gitignore        # Git忽略文件
```