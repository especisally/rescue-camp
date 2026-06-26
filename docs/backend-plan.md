# 应急救援战训营 — 后端实施方案

> **版本**：v1.0
> **日期**：2026-06-25
> **状态**：方案已确定，待实施
> **服务器**：www.yjjyzxy.top（宝塔面板）
>
> **阅读对象**：AI 助手，按此文档分步实施

---

## 目录

- [一、技术选型决策](#一技术选型决策)
- [二、整体架构](#二整体架构)
- [三、目录结构](#三目录结构)
- [四、核心依赖包](#四核心依赖包)
- [五、宝塔面板环境准备](#五宝塔面板环境准备)
- [六、Phase 1：地基（数据库 + 认证 + 骨架）](#六phase-1地基数据库--认证--骨架)
- [七、Phase 2：内容模块 API + 后台管理](#七phase-2内容模块-api--后台管理)
- [八、Phase 3：论坛 + 刷题](#八phase-3论坛--刷题)
- [九、Phase 4：用户中心 + 高级功能](#九phase-4用户中心--高级功能)
- [十、管理后台完整清单](#十管理后台完整清单)
- [十一、部署与运维](#十一部署与运维)

---

## 一、技术选型决策

| 层 | 选型 | 决策理由 |
|------|------|---------|
| 运行时 | **Node.js 18+ LTS** | 宝塔「Node 项目管理器」可一键安装 |
| 框架 | **Express.js** | 最简单、教程最多、生态最成熟 |
| 数据库 | **MySQL 5.7+** | 宝塔一键安装，适合作复杂关联查询 |
| ORM | **Prisma** | 定义 schema 自动生成 SQL，类型安全，不用手写 SQL |
| API 鉴权 | **JWT** (jsonwebtoken) | 小程序端存 token，请求时 Header 带 `Authorization: Bearer xxx` |
| 后台鉴权 | **Session + Cookie** (express-session) | 浏览器自动带 cookie，比 JWT 更适合 Web 后台 |
| 后台 SSR | **EJS 模板引擎** | 和写 HTML 一样，后端直接渲染，不用学 Vue/React |
| 后台样式 | **Bootstrap 5 CDN** | 现成 UI 组件，表格/表单/导航开箱即用 |
| 文件上传 | **multer** | Express 标准上传中间件 |
| 进程守护 | **PM2** | 宝塔自带，自动重启、日志管理 |
| 参数校验 | **express-validator** | 链式 API，清晰直观 |
| 密码加密 | **bcryptjs** | 管理员账号密码哈希 |
| 敏感词 | **text-censor** 或自建词库 | 论坛内容审核 |

**设计原则**：
- **极简实用**：后台用 Bootstrap 默认风格，开发快
- **先本地后云端**：文件存储先用服务器本地磁盘，量大了迁腾讯云 COS
- **Prisma 管理数据库**：定义 schema → 一键生成表，不需要手写 SQL

---

## 二、整体架构

```
                   ┌─────────────────────────┐
                   │   微信小程序 (前端/已完成)   │
                   └────────────┬────────────┘
                                │ HTTPS
                                ▼
┌──────────────────────────────────────────────────┐
│           www.yjjyzxy.top (Nginx)                 │
│                                                   │
│   /api/*       →  Express (Port 3000)             │ ← JWT 鉴权
│   /admin/*     →  Express (同一进程)               │ ← Session 鉴权
│   /uploads/*   →  静态文件目录                     │
│                                                   │
│   宝塔面板统一管理：Nginx + MySQL + PM2            │
└──────────────────────────────────────────────────┘
```

**关键点**：
- 一个 Express 应用同时承担 API（`/api/*`）和后台管理（`/admin/*`）
- Nginx 反向代理：`/api` 和 `/admin` 转发到 `localhost:3000`，`/uploads` 直接 serve 静态文件
- JWT token 过期策略：access_token 2h，refresh_token 7d

---

## 三、目录结构

```
server/                              # 在项目根目录创建
├── prisma/
│   ├── schema.prisma                # 数据库模型定义（19 张表）
│   └── seed.js                      # 初始数据填充（管理员 + 测试数据）
├── src/
│   ├── app.js                       # Express 应用初始化（中间件注册）
│   ├── server.js                    # 启动入口（监听 3000 端口）
│   ├── config/
│   │   └── index.js                 # 环境变量读取（DB/Redis/JWT 密钥等）
│   ├── middleware/
│   │   ├── apiAuth.js               # API JWT 鉴权中间件
│   │   ├── adminAuth.js             # 后台 Session 鉴权中间件
│   │   ├── errorHandler.js          # 统一错误处理
│   │   └── rateLimiter.js           # 接口频率限制
│   ├── routes/
│   │   ├── index.js                 # 总路由挂载
│   │   ├── api/                     # 小程序 API 路由（55 个接口）
│   │   │   ├── auth.js              #   POST /api/auth/login
│   │   │   ├── users.js             #   用户相关（me/signin/favorites/comments/uploads）
│   │   │   ├── banners.js           #   首页 Banner
│   │   │   ├── recommends.js        #   首页推荐
│   │   │   ├── videos.js            #   视频模块
│   │   │   ├── trainings.js         #   训练操法
│   │   │   ├── chemicals.js         #   危化品查询
│   │   │   ├── standards.js         #   考核标准
│   │   │   ├── equipment.js         #   器材装备
│   │   │   ├── learning.js          #   拓展学习
│   │   │   ├── quiz.js              #   刷题系统
│   │   │   ├── posts.js             #   论坛帖子
│   │   │   ├── comments.js          #   评论
│   │   │   ├── upload.js            #   文件上传
│   │   │   ├── notifications.js     #   消息通知
│   │   │   ├── search.js            #   全局搜索
│   │   │   └── feedback.js          #   意见反馈
│   │   └── admin/                   # 后台管理路由
│   │       ├── index.js             #   后台总路由 + 数据看板
│   │       ├── auth.js              #   后台登录/登出
│   │       ├── videos.js            #   视频管理 CRUD
│   │       ├── trainings.js         #   训练操法管理 CRUD
│   │       ├── chemicals.js         #   危化品管理 CRUD
│   │       ├── standards.js         #   考核标准管理 CRUD
│   │       ├── equipment.js         #   装备管理 CRUD
│   │       ├── quiz.js              #   题库管理（题库+题目）
│   │       ├── learning.js          #   拓展学习管理
│   │       ├── posts.js             #   帖子审核管理
│   │       ├── banners.js           #   Banner 管理
│   │       ├── users.js             #   用户管理
│   │       ├── feedbacks.js         #   反馈管理
│   │       └── settings.js          #   系统设置
│   ├── controllers/                 # 业务逻辑层（按模块分文件）
│   ├── services/                    # 数据操作层（Prisma 调用封装）
│   └── utils/                       # 工具函数
│       ├── response.js              #   统一 JSON 响应格式
│       ├── jwt.js                   #   JWT 签发/验证
│       └── wechat.js                #   微信 API 调用（code2Session）
├── views/                           # EJS 模板（管理后台页面）
│   ├── layouts/
│   │   └── main.ejs                 #   后台布局框架（侧边栏 + 顶栏 + 内容区）
│   ├── login.ejs                    #   后台登录页
│   ├── dashboard/
│   │   └── index.ejs                #   数据看板
│   ├── videos/
│   │   ├── list.ejs                 #   视频列表
│   │   └── form.ejs                 #   编辑/新增视频（复用）
│   ├── trainings/
│   │   ├── list.ejs
│   │   └── form.ejs
│   ├── chemicals/
│   │   ├── list.ejs
│   │   └── form.ejs
│   ├── standards/
│   │   ├── list.ejs
│   │   └── form.ejs
│   ├── equipment/
│   │   ├── list.ejs
│   │   └── form.ejs
│   ├── quiz/
│   │   ├── banks.ejs                #   题库列表
│   │   ├── bank-form.ejs            #   题库表单
│   │   ├── questions.ejs            #   题目列表
│   │   └── question-form.ejs        #   题目表单
│   ├── learning/
│   │   ├── list.ejs
│   │   └── form.ejs
│   ├── posts/
│   │   └── list.ejs                 #   帖子审核列表
│   ├── banners/
│   │   └── list.ejs                 #   Banner 配置
│   ├── users/
│   │   └── list.ejs                 #   用户列表
│   └── feedbacks/
│       └── list.ejs                 #   反馈列表
├── public/                           # 后台静态资源
│   └── admin/
│       ├── css/
│       │   └── admin.css            #   后台自定义样式（少量覆盖 Bootstrap）
│       └── js/
│           └── admin.js             #   后台通用 JS（确认删除、表单校验等）
├── uploads/                          # 用户上传文件
│   ├── images/                       #   图片（jpg/png/gif/webp）
│   ├── videos/                       #   视频（mp4/mov）
│   └── files/                        #   文档（pdf/docx）
├── .env                              # 环境变量（不提交 Git）
├── .env.example                      # 环境变量模板
├── .gitignore
├── package.json
├── ecosystem.config.js               # PM2 进程配置
└── README.md                         # 部署说明
```

---

## 四、核心依赖包

### package.json（dependencies）

```json
{
  "name": "rescue-camp-server",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "db:migrate": "npx prisma migrate deploy",
    "db:push": "npx prisma db push",
    "db:seed": "node prisma/seed.js",
    "db:studio": "npx prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.x",
    "express": "^4.18.x",
    "ejs": "^3.1.x",
    "jsonwebtoken": "^9.x",
    "express-session": "^1.17.x",
    "multer": "^1.4.x",
    "bcryptjs": "^2.4.x",
    "express-validator": "^7.x",
    "cors": "^2.8.x",
    "morgan": "^1.10.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "nodemon": "^3.x"
  }
}
```

**包说明**：
| 包 | 用途 |
|------|------|
| `express` | Web 框架 |
| `@prisma/client` + `prisma` | ORM（数据库操作） |
| `ejs` | 后台 HTML 模板渲染 |
| `jsonwebtoken` | JWT 签发和验证 |
| `express-session` | 后台登录 Session |
| `multer` | 文件上传处理 |
| `bcryptjs` | 管理员密码哈希 |
| `express-validator` | 请求参数校验 |
| `cors` | 跨域处理（小程序请求不受限） |
| `morgan` | HTTP 请求日志 |
| `dotenv` | 环境变量管理 |

---

## 五、宝塔面板环境准备

在开始编码前，先通过宝塔面板完成以下操作：

### 5.1 安装软件

```
宝塔面板 → 软件商店：
1. 安装「Node 项目管理器」— 选择 Node 18 LTS
2. 安装「MySQL 5.7」
3. 安装「PM2 管理器」
4. 确认「Nginx」已安装并运行
```

### 5.2 创建数据库

```
宝塔面板 → 数据库：
1. 添加数据库：名称 rescue_camp，编码 utf8mb4
2. 创建数据库用户（记录用户名和密码，写入 .env）
```

### 5.3 创建 Node 项目目录

```
方式一（宝塔面板操作）：
  宝塔面板 → 文件 → /www/wwwroot/yjjyzxy.top/server/
  上传项目文件 → Node 项目管理器 → 添加项目

方式二（Git 部署）：
  宝塔面板 → 网站 → 添加站点 yjjyzxy.top
  SSH 登录服务器 → git clone → npm install → PM2 启动
```

### 5.4 Nginx 反向代理配置

```nginx
# 在宝塔面板 → 网站 → yjjyzxy.top → 配置文件中添加：

# API 转发到 Express
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# 管理后台转发到 Express
location /admin/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# 上传文件直接由 Nginx 提供
location /uploads/ {
    alias /www/wwwroot/yjjyzxy.top/server/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# 上传文件大小限制
client_max_body_size 500m;
```

### 5.5 环境变量（.env）

```env
# 数据库
DATABASE_URL="mysql://用户名:密码@127.0.0.1:3306/rescue_camp?charset=utf8mb4"

# JWT
JWT_SECRET="替换为一串随机字符串，至少 32 位"
JWT_EXPIRES_IN="2h"
JWT_REFRESH_EXPIRES_IN="7d"

# 微信小程序
WECHAT_APPID="你的小程序 AppID"
WECHAT_SECRET="你的小程序 AppSecret"

# 服务器
PORT=3000
NODE_ENV=production

# Session
SESSION_SECRET="替换为另一串随机字符串"

# 上传
UPLOAD_MAX_SIZE_IMAGE=10485760
UPLOAD_MAX_SIZE_VIDEO=524288000
UPLOAD_DIR=uploads
```

---

## 六、Phase 1：地基（数据库 + 认证 + 骨架）

**目标**：搭建项目骨架、建表、实现微信登录和后台登录。

### 6.1 项目初始化

```bash
# 1. 在项目根目录创建 server 文件夹
mkdir -p server/src/{config,middleware,routes/{api,admin},controllers,services,utils}
mkdir -p server/views/layouts
mkdir -p server/public/admin/{css,js}
mkdir -p server/uploads/{images,videos,files}
mkdir -p server/prisma

# 2. 初始化 npm
cd server
npm init -y

# 3. 安装依赖
npm install express ejs @prisma/client jsonwebtoken express-session multer bcryptjs express-validator cors morgan dotenv
npm install -D prisma nodemon

# 4. 初始化 Prisma
npx prisma init
```

### 6.2 数据库 Schema（prisma/schema.prisma）

完整的 19 张表定义（按需求文档）。核心表如下：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ==================== 用户与认证 ====================

model User {
  id        Int      @id @default(autoincrement())
  openid    String   @unique
  unionid   String?
  nickname  String?
  avatar    String?
  phone     String?
  level     String   @default("普通用户")     // 普通用户/认证用户/管理员
  points    Int      @default(0)
  role      String   @default("user")        // user/certified/admin
  status    Int      @default(1)             // 1=正常 0=禁用
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  posts          Post[]
  comments       Comment[]
  quizRecords    QuizRecord[]
  signRecords    SignRecord[]
  favorites      Favorite[]
  likes          Like[]
  notifications  Notification[]
  feedbacks      Feedback[]
  orders         Order[]

  @@map("users")
}

// ==================== 分类 ====================

model Category {
  id       Int       @id @default(autoincrement())
  name     String
  type     String                              // video/training/chemical/equipment/quiz/learning/post
  parentId Int?      @map("parent_id")
  sort     Int       @default(0)
  status   Int       @default(1)

  videos     Video[]
  trainings  Training[]
  equipment  Equipment[]
  quizBanks  QuizBank[]
  posts      Post[]

  @@map("categories")
}

// ==================== 视频 ====================

model Video {
  id          Int      @id @default(autoincrement())
  title       String
  categoryId  Int      @map("category_id")
  coverUrl    String?  @map("cover_url")
  videoUrl    String?  @map("video_url")
  duration    Int?                                // 秒
  author      String?
  views       Int      @default(0)
  likes       Int      @default(0)
  description String?  @db.Text
  tags        Json?                                // ["灭火", "高层"]
  points      Int      @default(0)                 // 观看所需积分
  status      Int      @default(1)                 // 1=上架 0=下架 -1=删除
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  category Category @relation(fields: [categoryId], references: [id])

  @@map("videos")
}

// ==================== 训练操法 ====================

model Training {
  id          Int      @id @default(autoincrement())
  title       String
  categoryId  Int      @map("category_id")
  coverUrl    String?  @map("cover_url")
  steps       Json?                                // [{title, desc, image}]
  equipment   Json?                                // ["水带", "分水器"]
  cautions    String?  @db.Text
  videoUrl    String?  @map("video_url")
  status      Int      @default(1)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  category Category @relation(fields: [categoryId], references: [id])

  @@map("trainings")
}

// ==================== 危化品 ====================

model Chemical {
  id          Int      @id @default(autoincrement())
  name        String
  formula     String?
  unNumber    String?  @map("un_number")
  hazardClass String?  @map("hazard_class")
  hazardColor String?  @map("hazard_color")        // 色标值 #FF0000
  properties  Json?                                // {分子量, 沸点, 密度, 外观...}
  dangers     Json?                                // [{title, desc}]
  steps       Json?                                // [{title, desc}]
  protections Json?                                // [{title, desc}]
  status      Int      @default(1)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("chemicals")
}

// ==================== 考核标准 ====================

model Standard {
  id          Int      @id @default(autoincrement())
  title       String
  category    String                                // 体能/技能/理论/综合
  targetUser  String?  @map("target_user")          // 适用对象
  items       Json?                                 // [{name, standard}]
  detail      String?  @db.Text                     // 评分细则
  status      Int      @default(1)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("standards")
}

// ==================== 器材装备 ====================

model Equipment {
  id          Int      @id @default(autoincrement())
  name        String
  model       String?
  categoryId  Int      @map("category_id")
  imageUrl    String?  @map("image_url")
  status      Int      @default(1)                  // 1=正常 2=维修中 3=报废
  specs       Json?                                // [{name, value}]
  usage       String?  @db.Text
  scenario    String?  @db.Text                     // 适用场景
  maintenance String?  @db.Text                     // 维护保养
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  category         Category          @relation(fields: [categoryId], references: [id])
  repairRequests   RepairRequest[]
  requisitionForms RequisitionForm[]

  @@map("equipment")
}

// 报修
model RepairRequest {
  id          Int      @id @default(autoincrement())
  equipmentId Int      @map("equipment_id")
  userId      Int      @map("user_id")
  reason      String   @db.Text
  status      Int      @default(0)                  // 0=待处理 1=处理中 2=已完成
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("repair_requests")
}

// 领用
model RequisitionForm {
  id          Int      @id @default(autoincrement())
  equipmentId Int      @map("equipment_id")
  userId      Int      @map("user_id")
  reason      String   @db.Text
  status      Int      @default(0)
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("requisition_forms")
}

// ==================== 拓展学习 ====================

model Learning {
  id          Int      @id @default(autoincrement())
  title       String
  type        String                                // video/doc
  coverUrl    String?  @map("cover_url")
  fileUrl     String?  @map("file_url")
  category    String?
  author      String?
  duration    Int?
  fileSize    String?  @map("file_size")
  views       Int      @default(0)
  status      Int      @default(1)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("learning")
}

// ==================== 刷题 ====================

model QuizBank {
  id            Int      @id @default(autoincrement())
  title         String
  categoryId    Int      @map("category_id")
  icon          String?
  questionCount Int      @default(0) @map("question_count")
  status        Int      @default(1)
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  category  Category        @relation(fields: [categoryId], references: [id])
  questions QuizQuestion[]
  records   QuizRecord[]

  @@map("quiz_banks")
}

model QuizQuestion {
  id            Int    @id @default(autoincrement())
  bankId        Int    @map("bank_id")
  type          String                               // single/multi/judge
  question      String @db.Text
  options       Json?
  correctAnswer String @map("correct_answer")
  explanation   String? @db.Text

  bank QuizBank @relation(fields: [bankId], references: [id])

  @@map("quiz_questions")
}

model QuizRecord {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  bankId    Int      @map("bank_id")
  score     Int
  total     Int
  answers   Json?
  duration  Int?                                    // 秒
  createdAt DateTime @default(now()) @map("created_at")

  user User     @relation(fields: [userId], references: [id])
  bank QuizBank @relation(fields: [bankId], references: [id])

  @@map("quiz_records")
}

// ==================== 论坛 ====================

model Post {
  id           Int       @id @default(autoincrement())
  userId       Int       @map("user_id")
  title        String
  content      String?   @db.Text
  type         String    @default("text")           // text/video/image
  images       Json?                                // ["url1","url2"]
  videoUrl     String?   @map("video_url")
  categoryId   Int?      @map("category_id")
  tags         Json?                                // ["灭火", "经验"]
  points       Int       @default(0)                // 查看所需积分
  views        Int       @default(0)
  likes        Int       @default(0)
  commentsCount Int      @default(0) @map("comments_count")
  isEssence    Boolean   @default(false) @map("is_essence")
  status       Int       @default(1)                // 1=正常 0=待审核 -1=删除
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  user     User      @relation(fields: [userId], references: [id])
  category Category? @relation(fields: [categoryId], references: [id])
  comments Comment[]

  @@map("posts")
}

model Comment {
  id         Int      @id @default(autoincrement())
  userId     Int      @map("user_id")
  postId     Int      @map("post_id")
  parentId   Int?     @map("parent_id")              // 父评论 ID（子回复用）
  replyToUid Int?     @map("reply_to_uid")           // 回复给谁
  content    String   @db.Text
  likes      Int      @default(0)
  status     Int      @default(1)
  createdAt  DateTime @default(now()) @map("created_at")

  user    User      @relation(fields: [userId], references: [id])
  post    Post      @relation(fields: [postId], references: [id])
  parent  Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies Comment[] @relation("CommentReplies")

  @@map("comments")
}

// ==================== 互动 ====================

model Favorite {
  id         Int      @id @default(autoincrement())
  userId     Int      @map("user_id")
  targetType String   @map("target_type")           // post/video/training/learning
  targetId   Int      @map("target_id")
  createdAt  DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, targetType, targetId])
  @@map("favorites")
}

model Like {
  id         Int      @id @default(autoincrement())
  userId     Int      @map("user_id")
  targetType String   @map("target_type")           // post/comment
  targetId   Int      @map("target_id")
  createdAt  DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, targetType, targetId])
  @@map("likes")
}

// ==================== 通知 ====================

model Notification {
  id         Int      @id @default(autoincrement())
  userId     Int      @map("user_id")
  type       String                                // comment/like/system
  content    String
  targetType String?  @map("target_type")
  targetId   Int?     @map("target_id")
  isRead     Boolean  @default(false) @map("is_read")
  createdAt  DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("notifications")
}

// ==================== 签到 ====================

model SignRecord {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  signDate  DateTime @map("sign_date") @db.Date
  points    Int      @default(5)
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, signDate])
  @@map("sign_records")
}

// ==================== 轮播图/推荐 ====================

model Banner {
  id       Int     @id @default(autoincrement())
  title    String
  imageUrl String? @map("image_url")
  linkUrl  String? @map("link_url")
  sort     Int     @default(0)
  status   Int     @default(1)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("banners")
}

model Recommend {
  id        Int      @id @default(autoincrement())
  title     String
  type      String
  targetId  Int      @map("target_id")
  coverUrl  String?  @map("cover_url")
  tag       String?
  sort      Int      @default(0)
  status    Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("recommends")
}

// ==================== 反馈 ====================

model Feedback {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  content   String   @db.Text
  images    Json?
  contact   String?
  status    Int      @default(0)                     // 0=未处理 1=已处理
  reply     String?  @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("feedbacks")
}

// ==================== 管理员 ====================

model Admin {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String                                   // bcrypt 哈希
  role      String   @default("admin")
  status    Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("admins")
}
```

**执行建表**：
```bash
npx prisma db push
```

### 6.3 Express 应用骨架

#### src/config/index.js
```javascript
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  sessionSecret: process.env.SESSION_SECRET,
  wechatAppId: process.env.WECHAT_APPID,
  wechatSecret: process.env.WECHAT_SECRET,
  upload: {
    imageMaxSize: Number(process.env.UPLOAD_MAX_SIZE_IMAGE) || 10485760,
    videoMaxSize: Number(process.env.UPLOAD_MAX_SIZE_VIDEO) || 524288000,
    dir: process.env.UPLOAD_DIR || 'uploads',
  },
};
```

#### src/app.js
```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const path = require('path');
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// CORS
app.use(cors());

// 请求日志
app.use(morgan('short'));

// Body 解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session（管理后台用）
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 小时
}));

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/admin/assets', express.static(path.join(__dirname, '..', 'public', 'admin')));

// EJS 模板
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// 路由
app.use(routes);

// 错误处理
app.use(errorHandler);

module.exports = app;
```

#### src/server.js
```javascript
const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
```

### 6.4 统一响应格式

#### src/utils/response.js
```javascript
/**
 * 统一 JSON 响应
 * 格式：{ code: number, message: string, data: any }
 *
 * 错误码：
 *   0    — 成功
 *   401  — 未登录/token 过期
 *   403  — 无权限
 *   404  — 资源不存在
 *   422  — 参数校验失败
 *   500  — 服务器错误
 */

function success(data, message = 'success') {
  return { code: 0, message, data };
}

function fail(code, message) {
  return { code, message, data: null };
}

function paginate(list, page, pageSize, total) {
  return {
    code: 0,
    message: 'success',
    data: {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

module.exports = { success, fail, paginate };
```

### 6.5 JWT 鉴权中间件

#### src/middleware/apiAuth.js
```javascript
const jwt = require('jsonwebtoken');
const config = require('../config');
const { fail } = require('../utils/response');

// 必需登录
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(fail(401, '未登录或 token 已过期'));
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json(fail(401, 'Token 无效或已过期'));
  }
}

// 可选登录（游客也能访问，登录了则注入 userId）
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      req.userId = decoded.userId;
    } catch (err) {
      // 忽略无效 token，当作游客
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
```

### 6.6 微信登录 API

#### src/routes/api/auth.js
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../../config');
const wechat = require('../../utils/wechat');
const { success, fail } = require('../../utils/response');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/auth/login
 * Body: { code }
 * 微信登录：code → openid → 创建/查找用户 → 签发 JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(422).json(fail(422, '缺少登录凭证 code'));
    }

    // 1. code 换 openid
    const { openid, session_key } = await wechat.code2Session(code);
    if (!openid) {
      return res.status(500).json(fail(500, '微信登录失败'));
    }

    // 2. 查找或创建用户
    let user = await prisma.user.findUnique({ where: { openid } });
    if (!user) {
      user = await prisma.user.create({
        data: { openid, nickname: '消防员', role: 'user', level: '普通用户' },
      });
    }

    if (user.status === 0) {
      return res.status(403).json(fail(403, '账号已被禁用'));
    }

    // 3. 签发 JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.json(success({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        level: user.level,
        role: user.role,
        points: user.points,
      },
    }));

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json(fail(500, '登录失败'));
  }
});

module.exports = router;
```

### 6.7 微信 API 工具

#### src/utils/wechat.js
```javascript
const https = require('https');
const config = require('../config');

function code2Session(code) {
  return new Promise((resolve, reject) => {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wechatAppId}&secret=${config.wechatSecret}&js_code=${code}&grant_type=authorization_code`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.errcode) {
            console.error('WeChat API error:', json);
          }
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

module.exports = { code2Session };
```

### 6.8 管理后台登录

#### src/middleware/adminAuth.js
```javascript
const { fail } = require('../utils/response');

function adminAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  // API 请求返回 JSON，页面请求重定向到登录页
  if (req.path.startsWith('/api/')) {
    return res.status(401).json(fail(401, '请先登录'));
  }
  return res.redirect('/admin/login');
}

module.exports = { adminAuth };
```

#### views/login.ejs（后台登录页）
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>管理后台 - 应急救援战训营</title>
  <link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background: #f5f5f5; height: 100vh; display: flex; align-items: center; justify-content: center; }
    .login-card { width: 400px; padding: 40px; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .login-card h2 { text-align: center; margin-bottom: 30px; color: #1a56db; }
  </style>
</head>
<body>
  <div class="login-card">
    <h2>🛟 战训营管理后台</h2>
    <% if (error) { %>
      <div class="alert alert-danger"><%= error %></div>
    <% } %>
    <form method="POST" action="/admin/login">
      <div class="mb-3">
        <label class="form-label">用户名</label>
        <input type="text" name="username" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">密码</label>
        <input type="password" name="password" class="form-control" required>
      </div>
      <button type="submit" class="btn btn-primary w-100">登 录</button>
    </form>
  </div>
</body>
</html>
```

### 6.9 PM2 配置

#### ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'rescue-camp-api',
    script: './src/server.js',
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '500M',
  }],
};
```

### 6.10 Phase 1 完成标志

- [ ] 宝塔面板安装好 Node 18+MySQL 5.7+PM2
- [ ] 数据库 `rescue_camp` 创建成功，19 张表就绪
- [ ] `npm install` 成功，无报错
- [ ] `POST /api/auth/login` 可响应（需要真实小程序 code 测试）
- [ ] `GET /admin/login` 可打开登录页
- [ ] PM2 启动 `pm2 start ecosystem.config.js`，进程在线
- [ ] Nginx 反向代理生效，`https://www.yjjyzxy.top/api/health` 可达

---

## 七、Phase 2：内容模块 API + 后台管理

**目标**：完成核心内容模块（视频/训练/危化品/标准/装备/学习）的完整 CRUD API 和后台管理页面。

### 7.1 通用 CRUD 模式

每个内容模块遵循相同的开发模式：

```
1. Prisma Model（已定义）
2. API 路由（routes/api/xxx.js）
3. 后台路由（routes/admin/xxx.js）
4. EJS 模板（views/xxx/list.ejs + form.ejs）
5. 后台菜单注册（layouts/main.ejs）
```

#### API 列表接口通用模式

```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, query, validationResult } = require('express-validator');
const { success, fail, paginate } = require('../../utils/response');
const { requireAuth, optionalAuth } = require('../../middleware/apiAuth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/xxx — 列表
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
    const { keyword, categoryId, sort = 'latest' } = req.query;

    const where = { status: 1 };
    if (keyword) where.title = { contains: keyword };
    if (categoryId) where.categoryId = Number(categoryId);

    const orderBy = {};
    switch (sort) {
      case 'popular': orderBy.views = 'desc'; break;
      case 'oldest': orderBy.createdAt = 'asc'; break;
      default: orderBy.createdAt = 'desc'; break;
    }

    const [list, total] = await Promise.all([
      prisma.video.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy }),
      prisma.video.count({ where }),
    ]);

    return res.json(paginate(list, page, pageSize, total));
  } catch (err) {
    console.error(err);
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

// GET /api/xxx/:id — 详情
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const item = await prisma.video.findFirst({
      where: { id: Number(req.params.id), status: 1 },
    });
    if (!item) return res.status(404).json(fail(404, '资源不存在'));
    return res.json(success(item));
  } catch (err) {
    return res.status(500).json(fail(500, '服务器错误'));
  }
});

module.exports = router;
```

### 7.2 视频管理后台（示例）

#### routes/admin/videos.js — 列表
```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();
const prisma = new PrismaClient();

// 所有后台路由都需要登录
router.use(adminAuth);

// GET /admin/videos — 列表
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = 20;
  const { keyword, categoryId } = req.query;

  const where = { status: { not: -1 } };
  if (keyword) where.title = { contains: keyword };
  if (categoryId) where.categoryId = Number(categoryId);

  const [videos, total, categories] = await Promise.all([
    prisma.video.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.video.count({ where }),
    prisma.category.findMany({ where: { type: 'video', status: 1 } }),
  ]);

  res.render('videos/list', {
    title: '视频管理',
    videos,
    categories,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    keyword: keyword || '',
    categoryId: categoryId || '',
  });
});

// GET /admin/videos/create — 新增表单
router.get('/create', async (req, res) => {
  const categories = await prisma.category.findMany({ where: { type: 'video', status: 1 } });
  res.render('videos/form', { title: '新增视频', video: {}, categories, isEdit: false });
});

// POST /admin/videos — 保存新增
router.post('/', [
  body('title').notEmpty().withMessage('标题不能为空'),
  body('categoryId').isInt().withMessage('请选择分类'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const categories = await prisma.category.findMany({ where: { type: 'video', status: 1 } });
    return res.render('videos/form', { title: '新增视频', video: req.body, categories, isEdit: false, errors: errors.mapped() });
  }

  const { title, categoryId, coverUrl, videoUrl, duration, author, description, tags, points, status } = req.body;
  await prisma.video.create({
    data: {
      title,
      categoryId: Number(categoryId),
      coverUrl,
      videoUrl,
      duration: duration ? Number(duration) : null,
      author,
      description,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      points: Number(points) || 0,
      status: Number(status) || 1,
    },
  });

  res.redirect('/admin/videos');
});

// POST /admin/videos/:id/delete — 软删除
router.post('/:id/delete', async (req, res) => {
  await prisma.video.update({
    where: { id: Number(req.params.id) },
    data: { status: -1 },
  });
  res.redirect('/admin/videos');
});

module.exports = router;
```

### 7.3 后台布局模板

#### views/layouts/main.ejs
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %> — 应急救援战训营</title>
  <link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.bootcdn.net/ajax/libs/bootstrap-icons/1.11.0/font/bootstrap-icons.css" rel="stylesheet">
  <link href="/admin/assets/css/admin.css" rel="stylesheet">
</head>
<body>
  <div class="d-flex" style="min-height: 100vh">

    <!-- 侧边栏 -->
    <nav class="bg-dark text-white p-3" style="width: 220px; flex-shrink: 0;">
      <h5 class="mb-4">🛟 战训营后台</h5>
      <ul class="nav flex-column">
        <li class="nav-item"><a href="/admin" class="nav-link text-white">📊 数据看板</a></li>
        <li class="nav-item"><a href="/admin/banners" class="nav-link text-white">🎯 轮播图</a></li>
        <li class="nav-item"><a href="/admin/videos" class="nav-link text-white">📹 视频管理</a></li>
        <li class="nav-item"><a href="/admin/trainings" class="nav-link text-white">🏋️ 训练操法</a></li>
        <li class="nav-item"><a href="/admin/chemicals" class="nav-link text-white">⚗️ 危化品</a></li>
        <li class="nav-item"><a href="/admin/standards" class="nav-link text-white">📏 考核标准</a></li>
        <li class="nav-item"><a href="/admin/equipment" class="nav-link text-white">🔧 器材装备</a></li>
        <li class="nav-item"><a href="/admin/learning" class="nav-link text-white">📚 拓展学习</a></li>
        <li class="nav-item"><a href="/admin/quiz/banks" class="nav-link text-white">📝 题库管理</a></li>
        <li class="nav-item"><a href="/admin/posts" class="nav-link text-white">💬 帖子审核</a></li>
        <li class="nav-item"><a href="/admin/users" class="nav-link text-white">👥 用户管理</a></li>
        <li class="nav-item"><a href="/admin/feedbacks" class="nav-link text-white">📮 反馈管理</a></li>
        <li class="nav-item"><a href="/admin/settings" class="nav-link text-white">⚙️ 系统设置</a></li>
      </ul>
      <hr class="text-white-50">
      <a href="/admin/logout" class="nav-link text-white-50">退出登录</a>
    </nav>

    <!-- 内容区 -->
    <main class="flex-grow-1 p-4 bg-light">
      <h3 class="mb-4"><%= title %></h3>
      <%- body %>
    </main>
  </div>

  <script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
  <script src="/admin/assets/js/admin.js"></script>
</body>
</html>
```

### 7.4 后台自定义样式

#### public/admin/css/admin.css
```css
/* 侧边栏激活态 */
.nav-link:hover { background: rgba(255,255,255,0.1); border-radius: 6px; }

/* 表格优化 */
.table th { white-space: nowrap; }
.table td { vertical-align: middle; }

/* 缩略图 */
.img-thumb-sm { width: 60px; height: 40px; object-fit: cover; border-radius: 4px; }

/* 表单优化 */
.form-label { font-weight: 500; }
```

### 7.5 Phase 2 完成标志

- [ ] 视频 CRUD 完整（API + 后台列表/新增/编辑/删除）
- [ ] 训练操法 CRUD 完整
- [ ] 危化品 CRUD 完整
- [ ] 考核标准 CRUD 完整
- [ ] 器材装备 CRUD 完整（含报修/领用审批）
- [ ] 拓展学习 CRUD 完整
- [ ] 首页 Banner + 推荐 配置后台
- [ ] 文件上传 API（图片/视频/文件）
- [ ] 列表接口均支持分页+搜索+筛选

---

## 八、Phase 3：论坛 + 刷题

**目标**：论坛完整链路（发帖/评论/点赞/收藏/签到）+ 刷题系统（题库管理/答题/交卷/错题本）。

### 8.1 论坛 API 核心逻辑

**帖子列表**（`GET /api/posts`）：
- 4 个 tab：latest（最新）/ hot（热门，按 likes 排序）/ essence（精华，isEssence=true）/ resource（资源，type=video）
- 分页 + 搜索关键词（搜索标题和内容）
- 返回作者信息 include user
- 已登录用户标记是否已点赞/已收藏

**帖子详情**（`GET /api/posts/:id`）：
- 帖子完整信息 + 作者信息
- 自动增加 views
- 当前用户是否已点赞/已收藏
- 评论区独立加载（另一个接口）

**发帖**（`POST /api/posts`）：
- 需要登录（requireAuth）
- 参数校验：标题、内容、类型
- 支持上传图片/视频（先用 upload API 上传，拿到 URL 再发帖）
- 发帖成功后发送通知（@评论场景略）

**评论/回复**（`POST /api/comments`）：
- 需要登录
- parentId === null → 一级评论
- parentId !== null → 子回复，需携带 replyToUid

**点赞/取消点赞**：
- 查找是否已存在 like 记录
- 存在则删除，不存在则创建
- 更新对应 target 的 likes 计数

**签到**（`POST /api/users/signin`）：
- 检查今天是否已签到（sign_records 表 unique(userId, signDate)）
- 未签到 → 插入记录 + 增加 5 积分

### 8.2 论坛后台

- 帖子列表：可筛选状态（全部/待审核/正常/已删除）
- 审核操作：通过（status 0→1）/ 拒绝（status 0→-1）
- 精华管理：设置/取消精华
- 删除操作：软删除（status → -1）
- 评论管理：查看 + 删除违规评论

### 8.3 刷题系统

**题库管理后台**：
- 题库 CRUD（标题、分类、图标）
- 题目 CRUD：
  - 类型：单选（single）/ 多选（multi）/ 判断（judge）
  - 选项：JSON 格式 [{label:"A", text:"..."}]
  - 正确答案：单选题 "A"，多选题 "A,B"，判断题 "对"|"错"
  - 解析：富文本

**答题 API**：
- `GET /api/quiz/banks` — 题库列表
- `GET /api/quiz/banks/:id/questions?page=X` — 分页获取题目（每页 1 题或 10 题）
- `POST /api/quiz/submit` — 提交答题记录
  ```json
  {
    "bankId": 1,
    "answers": [
      { "questionId": 101, "selected": "B" },
      { "questionId": 102, "selected": "A" }
    ],
    "duration": 360
  }
  ```
  后端自动判分（对比 correctAnswer），返回得分和每题结果

- `GET /api/quiz/records` — 答题历史列表
- `GET /api/quiz/records/wrong` — 错题本（筛选 score < total 的记录）

### 8.4 Phase 3 完成标志

- [ ] 帖子列表/详情/发帖 API 完整
- [ ] 评论/回复/点赞/收藏 API 完整
- [ ] 签到功能（防重复签到）
- [ ] 帖子审核后台（通过/拒绝/精华）
- [ ] 题库 CRUD 后台 + 题目 CRUD 后台
- [ ] 答题 API（取题/提交/判分/错题本）

---

## 九、Phase 4：用户中心 + 高级功能

### 9.1 用户中心 API

- `GET /api/users/me` — 个人信息
- `PUT /api/users/me` — 编辑资料（昵称/头像/手机）
- `GET /api/users/me/progress` — 学习进度统计（已完成视频数/训练数/答题数/正确率）
- `GET /api/users/me/favorites` — 我的收藏（分页，按 targetType 筛选）
- `GET /api/users/me/comments` — 我的评论（分页）
- `GET /api/users/me/uploads` — 我的上传（可扩展，当前前端为 toast）

### 9.2 消息通知

- `GET /api/notifications` — 通知列表（分页，按时间倒序）
- `POST /api/notifications/:id/read` — 标记已读
- `GET /api/notifications/unread-count` — 未读数（供铃铛角标）

**通知触发时机**：
- 帖子被评论 → 通知帖子作者
- 评论被回复 → 通知被回复用户
- 帖子被设为精华 → 通知作者
- 系统通知（后台手动发送，可选）

### 9.3 全局搜索

- `GET /api/search?type=video|post|equipment|learning&keyword=X&page=X`
- 按 type 在不同的表中搜索
- 返回统一格式的搜索结果列表

### 9.4 性能优化

- Redis 缓存热点数据（Banner、推荐内容、首页数据）
- 播放量/点赞数用 Redis 计数，定时批量同步到 MySQL
- CDN 配置（图片/视频静态资源）

### 9.5 安全加固

- 接口频率限制（express-rate-limit）
- 敏感词过滤（论坛发帖/评论内容）
- 上传文件 MIME 类型白名单校验
- SQL 注入防护（Prisma 已参数化查询，天生防注入）
- XSS 防护（EJS 默认转义）

### 9.6 Phase 4 完成标志

- [ ] 用户中心全部 API 就绪
- [ ] 通知列表 + 标记已读
- [ ] 全局搜索可用
- [ ] 接口频率限制生效
- [ ] 敏感词过滤生效
- [ ] 文件上传安全校验通过

---

## 十、管理后台完整清单

后台访问地址：`https://www.yjjyzxy.top/admin`

| 菜单 | 路径 | 功能 |
|------|------|------|
| 🔐 登录 | `/admin/login` | 管理员登录/登出 |
| 📊 数据看板 | `/admin` | 总用户/总视频/今日活跃/新增帖子 |
| 🎯 轮播图 | `/admin/banners` | 排序 + 上下架 |
| 📹 视频管理 | `/admin/videos` | 列表/新增/编辑/删除/上下架 |
| 🏋️ 训练操法 | `/admin/trainings` | 列表/新增/编辑/删除 |
| ⚗️ 危化品 | `/admin/chemicals` | 列表/新增/编辑/删除 |
| 📏 考核标准 | `/admin/standards` | 列表/新增/编辑/删除 |
| 🔧 器材装备 | `/admin/equipment` | 列表/新增/编辑/删除 + 报修/领用审批 |
| 📚 拓展学习 | `/admin/learning` | 列表/新增/编辑/删除 |
| 📝 题库管理 | `/admin/quiz/banks` | 题库 CRUD |
| 📝 题目管理 | `/admin/quiz/banks/:id/questions` | 题目 CRUD（题库下钻） |
| 💬 帖子审核 | `/admin/posts` | 审核 + 精华 + 删除 |
| 👥 用户管理 | `/admin/users` | 列表/审核认证/禁用 |
| 📮 反馈管理 | `/admin/feedbacks` | 查看 + 回复 |
| ⚙️ 系统设置 | `/admin/settings` | 管理员账号 + 全局配置 |

---

## 十一、部署与运维

### 11.1 首次部署流程

```bash
# 1. SSH 登录服务器
ssh root@www.yjjyzxy.top

# 2. 进入项目目录
cd /www/wwwroot/yjjyzxy.top

# 3. 克隆 / 上传项目
git clone <仓库地址> server

# 4. 进入 server 目录
cd server

# 5. 安装依赖
npm install --production

# 6. 创建 .env 文件
cp .env.example .env
nano .env   # 填写数据库密码、微信 AppID/Secret、JWT 密钥

# 7. 初始化数据库
npx prisma db push
npx prisma db seed   # 创建默认管理员账号

# 8. 创建上传目录
mkdir -p uploads/{images,videos,files}

# 9. 启动 PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # 开机自启
```

### 11.2 日常运维

```bash
# 查看日志
pm2 logs rescue-camp-api

# 重启
pm2 restart rescue-camp-api

# 更新代码
git pull
npm install --production   # 如有新依赖
npx prisma db push         # 如有 schema 变更
pm2 restart rescue-camp-api
```

### 11.3 数据库备份

在宝塔面板中设置定时任务：
```
宝塔面板 → 计划任务 → 添加
任务类型：备份数据库
数据库：rescue_camp
执行周期：每天凌晨 3:00
保留份数：7
备份目录：/www/backup/
```

### 11.4 健康检查

```
GET /api/health
响应：{ "code": 0, "data": { "status": "ok", "db": "connected", "uptime": 123456 } }
```

---

## 附录 A：前端接入改造清单

后端 API 完成后，前端需要做以下改动以接入真实数据：

| 页面 | 改动内容 |
|------|---------|
| `config/index.js` | `baseUrl` 改为 `https://www.yjjyzxy.top/api` |
| `utils/request.js` | 请求 Header 加 `Authorization: Bearer <token>` |
| `app.js` | 增加 token 管理（存储/读取/过期判断） |
| `login/index` | 接入 `POST /api/auth/login`（wx.login → code → token） |
| 所有列表页 | `data.mockList` → `onLoad` 请求 API，替换静态数据 |
| `video/play` | `<view>` 占位 → `<video>` 组件 + 真实视频 URL |
| `forum/post` | 真实上传 `wx.chooseMedia` → `POST /api/upload/image` |
| `quiz/detail` | 真实答题 → `POST /api/quiz/submit` 提交判分 |
| 个人中心 | 签到/收藏/评论/上传 全部接入对应 API |

---

## 附录 B：常用资源链接

- [Express 官方文档](https://expressjs.com/zh-cn/)
- [Prisma 文档](https://prisma.yoga/)
- [Bootstrap 5 文档](https://v5.bootcn.org/)
- [EJS 模板语法](https://ejs.bootcss.com/)
- [微信小程序登录流程](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
- [宝塔面板 Node 项目管理](https://www.bt.cn/bbs/thread-47014-1-1.html)

---

> **下一步**：将此文档发给新的 AI 会话窗口，从 Phase 1 开始逐步实施。
