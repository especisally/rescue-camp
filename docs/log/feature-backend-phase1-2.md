# 后端 Phase 1-2 开发日志 — 地基 + 内容模块

## 0.0.9 ~ 0.1.0 - 2026-06-25

### 改动类型: 新增

---

## Phase 1：地基（数据库 + 认证 + 骨架）

### 新增文件
- `server/package.json` — 项目依赖配置
- `server/.env.example` — 环境变量模板
- `server/.gitignore` — Git 忽略规则
- `server/ecosystem.config.js` — PM2 进程配置
- `server/prisma/schema.prisma` — 19 张数据库表定义
- `server/prisma/seed.js` — 种子数据（管理员 + 测试数据）
- `server/src/app.js` — Express 应用初始化
- `server/src/server.js` — 启动入口
- `server/src/config/index.js` — 环境变量读取
- `server/src/utils/response.js` — 统一 JSON 响应格式
- `server/src/utils/jwt.js` — JWT 签发/验证
- `server/src/utils/wechat.js` — 微信 API 调用（code2Session）
- `server/src/middleware/apiAuth.js` — API JWT 鉴权（requireAuth + optionalAuth）
- `server/src/middleware/adminAuth.js` — 后台 Session 鉴权
- `server/src/middleware/errorHandler.js` — 统一错误处理
- `server/src/middleware/rateLimiter.js` — 简易频率限制
- `server/src/services/prisma.js` — 共享 Prisma 客户端
- `server/src/services/query.js` — 通用列表/详情查询辅助
- `server/src/services/adminCrud.js` — 后台通用 CRUD 辅助
- `server/src/routes/index.js` — 总路由挂载
- `server/src/routes/api/auth.js` — POST /api/auth/login
- `server/src/routes/admin/auth.js` — 后台登录/登出
- `server/views/login.ejs` — 后台登录页
- `server/views/layouts/main.ejs` — 后台布局框架
- `server/views/dashboard/index.ejs` — 数据看板
- `server/public/admin/css/admin.css` — 后台自定义样式
- `server/public/admin/js/admin.js` — 后台通用 JS

### 数据库建表
- users, admins, categories（19+ 张表）
- 所有表已通过 Prisma Schema 定义
- `npx prisma db push` → MySQL 建表

---

## Phase 2：内容模块 API + 后台管理

### API 模块
| 文件 | 接口数 | 说明 |
|------|--------|------|
| `routes/api/videos.js` | 3 | 视频列表/详情/播放量 |
| `routes/api/trainings.js` | 3 | 操法列表/详情/进度 |
| `routes/api/chemicals.js` | 2 | 危化品列表/详情 |
| `routes/api/standards.js` | 2 | 考核标准列表/详情 |
| `routes/api/equipment.js` | 4 | 装备列表/详情/报修/领用 |
| `routes/api/learning.js` | 2 | 拓展学习列表/详情 |
| `routes/api/banners.js` | 1 | 轮播图列表 |
| `routes/api/upload.js` | 3 | 图片/视频/文件上传 |
| `routes/api/users.js` | 3 | 个人信息/更新/签到 |

### 管理后台模块
| 文件 | 功能 |
|------|------|
| `routes/admin/index.js` | 数据看板 |
| `routes/admin/videos.js` | 视频 CRUD（列表/新增/编辑/删除/上下架）|
| `routes/admin/trainings.js` | 训练操法 CRUD |
| `routes/admin/chemicals.js` | 危化品 CRUD |
| `routes/admin/standards.js` | 考核标准 CRUD |
| `routes/admin/equipment.js` | 器材装备 CRUD |
| `routes/admin/learning.js` | 拓展学习 CRUD |
| `routes/admin/banners.js` | 轮播图 + 推荐管理 |

### EJS 视图（14 个）
- `views/videos/list.ejs` + `views/videos/form.ejs`
- `views/trainings/list.ejs` + `views/trainings/form.ejs`
- `views/chemicals/list.ejs` + `views/chemicals/form.ejs`
- `views/standards/list.ejs` + `views/standards/form.ejs`
- `views/equipment/list.ejs` + `views/equipment/form.ejs`
- `views/learning/list.ejs` + `views/learning/form.ejs`
- `views/banners/list.ejs`
- `views/dashboard/index.ejs`

### API 接口清单（共 20 个）
| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1 | POST | `/api/auth/login` | 微信登录 |
| 2 | GET | `/api/health` | 健康检查 |
| 3 | GET | `/api/users/me` | 个人信息 |
| 4 | PUT | `/api/users/me` | 更新资料 |
| 5 | POST | `/api/users/signin` | 签到 |
| 6 | GET | `/api/banners` | Banner 列表 |
| 7 | GET | `/api/recommends` | 推荐内容 |
| 8 | GET | `/api/videos` | 视频列表 |
| 9 | GET | `/api/videos/:id` | 视频详情 |
| 10 | POST | `/api/videos/:id/view` | 播放量 +1 |
| 11 | GET | `/api/trainings` | 操法列表 |
| 12 | GET | `/api/trainings/:id` | 操法详情 |
| 13 | POST | `/api/trainings/:id/progress` | 学习进度 |
| 14 | GET | `/api/chemicals` | 危化品列表 |
| 15 | GET | `/api/chemicals/:id` | 危化品详情 |
| 16 | GET | `/api/standards` | 标准列表 |
| 17 | GET | `/api/standards/:id` | 标准详情 |
| 18 | GET | `/api/equipment` | 装备列表 |
| 19 | GET | `/api/equipment/:id` | 装备详情 |
| 20 | POST | `/api/equipment/:id/repair` | 报修申请 |
| 21 | POST | `/api/equipment/:id/requisition` | 领用申请 |
| 22 | GET | `/api/learning` | 学习列表 |
| 23 | GET | `/api/learning/:id` | 学习详情 |
| 24 | POST | `/api/upload/image` | 上传图片 |
| 25 | POST | `/api/upload/video` | 上传视频 |
| 26 | POST | `/api/upload/file` | 上传文件 |

### 种子数据
- 管理员账号: admin / admin123
- 视频分类 8 类 + 示例视频 4 条
- 训练分类 4 类 + 装备分类 6 类 + 题库分类 6 类
- Banner 3 张 + 示例危化品 2 条 + 示例考核标准 2 条

---

### 相关文件
- 所有 `server/src/routes/api/*.js`
- 所有 `server/src/routes/admin/*.js`
- 所有 `server/views/**/*.ejs`
- `server/prisma/schema.prisma`
- `server/prisma/seed.js`
