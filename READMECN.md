# AI 助手平台

一个基于 Next.js + TypeScript + PostgreSQL + Prisma + OpenAI API 的全栈 AI SaaS 应用。

## 功能特性

### 📝 AI 写作助手
- 支持多种内容类型：博客文章、邮件、社交媒体、论文、故事、营销文案、技术文档
- 可调整语气风格：专业正式、轻松随意、友好亲切、严肃正式、幽默风趣、说服力强
- 自定义目标字数
- 历史记录保存和管理

### 📚 智能文档问答
- 上传和创建文档
- 基于文档内容的 AI 智能问答
- 问答历史追踪

### 💻 AI 代码审查
- 支持 15+ 种编程语言
- 代码质量评分（0-100分）
- 自动检测问题
- 提供优化建议

### 🔐 用户认证
- 基于 NextAuth.js 的完整登录/注册系统
- 会话管理
- 受保护的路由

## 技术栈

- **框架**: Next.js 15 + React 19 + TypeScript
- **样式**: Tailwind CSS 3
- **数据库**: PostgreSQL
- **ORM**: Prisma 5
- **认证**: NextAuth.js 4
- **AI**: OpenAI GPT-4 API
- **UI 组件**: Radix UI + Lucide Icons

## 数据库配置

```
主机: 8.155.53.159
数据库: pgsql
用户名: admin
密码: admin123
```

## 快速开始

### 1. 安装依赖

```bash
cd ai-assistant-platform/my-app
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# 数据库配置（已配置好）
DATABASE_URL="postgresql://admin:admin123@8.155.53.159:5432/pgsql"

# NextAuth 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# OpenAI API 密钥（AI 功能必需）
OPENAI_API_KEY="sk-your-openai-api-key-here"

# 应用配置
NEXT_PUBLIC_APP_NAME="AI Assistant Platform"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. 数据库设置

数据库迁移已经应用。如需重置：

```bash
# 生成 Prisma 客户端
npm run db:generate

# 运行迁移（如需要）
npm run db:migrate

# 打开 Prisma Studio 可视化数据库
npm run db:studio
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
my-app/
├── prisma/
│   └── schema.prisma          # 数据库模型定义
├── src/
│   ├── app/
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 认证 API
│   │   │   └── ai/            # AI 功能 API
│   │   │       ├── writing/   # 写作助手 API
│   │   │       ├── document/  # 文档问答 API
│   │   │       └── code-review/ # 代码审查 API
│   │   ├── dashboard/         # 仪表板页面
│   │   ├── writing/           # AI 写作助手页面
│   │   ├── documents/         # 文档问答页面
│   │   ├── code-review/       # 代码审查页面
│   │   └── login/             # 登录/注册页面
│   ├── components/
│   │   ├── ui/                # UI 组件
│   │   ├── Navbar.tsx         # 导航栏
│   │   ├── ToastProvider.tsx  # 消息提示
│   │   └── SessionProvider.tsx # 会话管理
│   ├── lib/
│   │   ├── prisma.ts          # Prisma 客户端
│   │   ├── auth.ts            # NextAuth 配置
│   │   ├── openai.ts          # OpenAI 客户端
│   │   └── utils.ts           # 工具函数
│   └── middleware.ts          # 认证中间件
├── .env                       # 环境变量
├── .env.local                 # 本地环境变量
├── next.config.ts             # Next.js 配置
├── package.json               # 依赖管理
├── Dockerfile                 # Docker 配置
└── README.md                  # 项目文档
```

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/[...nextauth]` - 登录/登出

### AI 写作助手
- `GET /api/ai/writing` - 获取写作任务列表
- `POST /api/ai/writing` - 创建新写作任务
- `DELETE /api/ai/writing?id={id}` - 删除写作任务

### 智能文档问答
- `GET /api/ai/document` - 获取文档列表
- `POST /api/ai/document` - 创建文档 / 提问
- `DELETE /api/ai/document?id={id}` - 删除文档

### AI 代码审查
- `GET /api/ai/code-review` - 获取代码审查列表
- `POST /api/ai/code-review` - 创建代码审查
- `DELETE /api/ai/code-review?id={id}` - 删除代码审查

## 可用脚本

```bash
# 开发
npm run dev              # 启动开发服务器

# 生产
npm run build            # 构建生产版本
npm run start            # 启动生产服务器

# 数据库
npm run db:migrate       # 运行数据库迁移
npm run db:generate      # 生成 Prisma 客户端
npm run db:studio        # 打开 Prisma Studio
npm run db:push          # 推送 schema 到数据库

# 代码检查
npm run lint             # 运行 ESLint
```

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t ai-assistant-platform .

# 运行容器
docker run -p 3000:3000 --env-file .env ai-assistant-platform
```

### 服务器部署

1. 上传代码到服务器
2. 安装依赖: `npm install --production`
3. 构建: `npm run build`
4. 启动: `npm start`

### 生产环境变量

```env
# 必需
DATABASE_URL="postgresql://admin:admin123@8.155.53.159:5432/pgsql"
NEXTAUTH_SECRET="your-production-secret-key"
OPENAI_API_KEY="sk-your-openai-api-key"

# 可选
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 支持的编程语言（代码审查）

- JavaScript / TypeScript
- Python
- Java
- Go
- Rust
- C / C++
- C#
- PHP
- Ruby
- Swift
- Kotlin
- SQL
- HTML / CSS
- Shell / Bash

## 界面预览

### 仪表板
功能概览，快速访问所有 AI 工具。

### AI 写作助手
创建各种类型的内容，可自定义语气和长度。

### 文档问答
上传文档并基于内容提问。

### 代码审查
获取 AI 驱动的代码分析，包括质量评分和优化建议。

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 技术支持

如遇到问题或有疑问：

1. 查看本 README 文档
2. 查看源代码中的注释
3. 在项目仓库提交 Issue

## 致谢

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [OpenAI](https://openai.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
