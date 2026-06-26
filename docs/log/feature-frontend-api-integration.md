# 前端 API 接入 — 全部 28 页面集成 + 服务器部署

## 0.2.1 - 2026-06-26

### 改动类型: 新增

---

## 一、Bug 修复

### 1.1 敏感词过滤 Bug
- **文件**: `server/src/utils/sensitiveFilter.js:59`
- **问题**: `REPEAT_CHAR` 未定义，调用 `filter()` 函数会抛出 `ReferenceError`
- **修复**: `REPEAT_CHAR` → `REPLACE_CHAR`

### 1.2 管理后台 500 错误（EJS 布局 Bug）
- **问题**: `views/layouts/main.ejs` 使用 `<%- body %>` 但变量 `body` 未定义
- **原因**: 子视图（如 `dashboard/index.ejs`）通过 `<%- include('../layouts/main') %>` 引用布局，但 `body` 变量的内容是 include **之后** 的 HTML，EJS 无法捕获
- **修复方案**: 将 `main.ejs` 拆分为 `header.ejs`（页头+侧边栏+主内容区开标签）和 `footer.ejs`（闭合标签+脚本），每个视图分别引入 header 和 footer，内容写在中间
- **影响范围**: 24 个视图文件（`views/**/*.ejs`）
- **新增文件**: `views/layouts/header.ejs`、`views/layouts/footer.ejs`
- **修改文件**: 批量替换 24 个视图中的 `../layouts/main` → `../layouts/header`，并追加 `../layouts/footer`

---

## 二、种子数据扩充

### 新增内容

| 类型 | 数量 | 文件 |
|------|------|------|
| 训练操法 | 4 条 | `prisma/seed.js` |
| 装备 | 6 件 | `prisma/seed.js` |
| 题库 | 3 个（21 题） | `prisma/seed.js` |
| 帖子 | 5 篇 | `prisma/seed.js` |
| 评论 | 6 条 | `prisma/seed.js` |
| 推荐 | 5 条 | `prisma/seed.js` |
| 危化品 | +2 条（共 4） | `prisma/seed.js` |
| 考核标准 | +2 条（共 4） | `prisma/seed.js` |

### 设计变更
- 种子数据脚本改为**可重复执行**：使用 `deleteMany()` 清空后重新插入，避免重复数据
- 使用 `upsert` 保证管理员账号和分类数据不重复

---

## 三、前端 API 基础设施（新建 3 文件）

| 文件 | 说明 |
|------|------|
| `miniprogram/config/index.js` | API 基地址 `https://www.yjjyzxy.top/api` + 超时配置 |
| `miniprogram/utils/request.js` | HTTP 请求封装（GET/POST/PUT/DELETE + 文件上传）、Token 注入（Header `Authorization: Bearer <token>`）、统一错误拦截（401/403/404/422/500） |
| `miniprogram/utils/util.js` | 工具函数：`formatTime`、`formatCount`、`formatDuration`、`truncate` |

### app.js 重构
- **文件**: `miniprogram/app.js`
- 新增 Token 管理：`loginSuccess()`、`logout()`、`checkLoginState()`、`fetchUserProfile()`
- 登录状态持久化到 `wx.setStorageSync`
- 启动时自动从本地恢复 token 和用户信息
- 新增 `globalData.token` 字段

---

## 四、28 个页面接入真实 API

### 4.1 视频模块（3 页）

| 页面 | 文件 | 接入 API |
|------|------|---------|
| 视频分类 | `video/index.js` | 分类通过 `GET /api/videos` 验证 API 可用性，保留 fallback 分类数据 |
| 分类详情 | `video/category.js` | `GET /api/videos?categoryId=&keyword=&sort=`，搜索/筛选/分页全部走 API |
| 视频播放 | `video/play.js` | `GET /api/videos/:id`（详情）+ `POST /api/videos/:id/view`（播放量）+ 相关推荐 |

**改动要点**:
- 移除所有 `getVideosByCategory()` 硬编码数据（约 80 行）
- 新增 `fetchVideos()`、`filterList()` 走服务端
- 播放页支持 `fallback` 数据，API 不可用时不白屏
- 支持下拉加载更多（`onReachBottom`）

### 4.2 论坛模块（3 页）

| 页面 | 文件 | 接入 API |
|------|------|---------|
| 帖子列表 | `forum/index.js` | `GET /api/posts?tab=&page=`，4 Tab（最新/热门/精华/资源） |
| 帖子详情 | `forum/detail/detail.js` | `GET /api/posts/:id` + `POST /api/posts/:id/like` + `POST /api/posts/:id/favorite` + `GET /api/posts/:id/comments` + `POST /api/comments` + `POST /api/comments/:id/like` |
| 发帖 | `forum/post.js` | `POST /api/posts` + `POST /api/upload/image`（真实图片上传） |

**改动要点**:
- 签到 `POST /api/users/signin` 走真实 API，防重复签到
- 评论支持嵌套回复（`parentId` + `replyToUid`）
- 评论点赞/取消走 API
- 发帖支持 `wx.chooseMedia` 真实上传
- 列表支持下拉加载更多

### 4.3 刷题模块（3 页）

| 页面 | 文件 | 接入 API |
|------|------|---------|
| 题库列表 | `quiz/index.js` | `GET /api/quiz/banks?categoryId=` |
| 答题页 | `quiz/detail.js` | `GET /api/quiz/banks/:id/questions` + `POST /api/quiz/submit` |
| 结果页 | `quiz/result.js` | 接收 `submit` 返回的判分结果 |

**改动要点**:
- 题目从 API 分页加载（最多 100 题/次）
- 自动判分：单选/多选/判断三种题型
- 选中后显示正误 + 解析
- 多选题支持 toggle 多选 + 确认按钮
- 答题卡实时更新完成状态
- 交卷走 `POST /api/quiz/submit`，后端判分返回每题结果
- 结果通过 `app.globalData.quizResult` 传递

### 4.4 战训工具（4 页）

| 页面 | 文件 | 接入 API |
|------|------|---------|
| 危化品列表 | `tools/chemical.js` | `GET /api/chemicals?keyword=&page=` |
| 危化品详情 | `tools/chemical-detail.js` | `GET /api/chemicals/:id` |
| 考核标准列表 | `tools/standard.js` | `GET /api/standards?keyword=&page=` |
| 考核标准详情 | `tools/standard-detail.js` | `GET /api/standards/:id` |

**改动要点**:
- 危化品详情解析后端 JSON 字段（`properties`/`dangers`/`steps`/`protections`）
- 考核标准分类映射（`物理考核` ↔ `physical`）
- 列表支持搜索 + 分类筛选 + 分页加载

### 4.5 训练操法（2 页）

| 页面 | 文件 | 接入 API |
|------|------|---------|
| 操法列表 | `training/index.js` | `GET /api/trainings?keyword=&categoryId=&page=` |
| 操法详情 | `training/detail/detail.js` | `GET /api/trainings/:id` + `POST /api/trainings/:id/progress` |

**改动要点**:
- 详情页解析后端 `steps`（JSON）、`equipment`（JSON 数组）、`cautions` 字段
- 进入详情自动记录学习进度
- 分类筛选对应后端 4 个训练分类（灭火/救人/体能/装备）

### 4.6 器材装备（2 页）

| 页面 | 文件 | 接入 API |
|------|------|---------|
| 装备列表 | `equipment/index.js` | `GET /api/equipment?keyword=&categoryId=&page=` |
| 装备详情 | `equipment/detail.js` | `GET /api/equipment/:id` + `POST /api/equipment/:id/repair` + `POST /api/equipment/:id/requisition` |

**改动要点**:
- 详情页解析后端 JSON `specs` 字段
- **报修功能**：弹窗输入原因 → `POST /api/equipment/:id/repair`，需登录
- **领用功能**：弹窗输入原因 → `POST /api/equipment/:id/requisition`，需登录
- 列表支持列表/网格双视图切换

### 4.7 拓展学习（2 页）

| 页面 | 文件 | 接入 API |
|------|------|---------|
| 学习列表 | `learning/index.js` | `GET /api/learning?pageSize=50` |
| 学习详情 | `learning/detail/detail.js` | `GET /api/learning/:id` |

**改动要点**:
- 自动区分视频/文档类型
- 详情页同时支持视频和文档展示

### 4.8 用户中心（5 页）

| 页面 | 文件 | 接入 API |
|------|------|---------|
| 个人主页 | `profile/index.js` | 从 `app.globalData` 读取用户信息 |
| 编辑资料 | `profile/edit/edit.js` | `PUT /api/users/me` + `POST /api/upload/image`（头像上传） |
| 我的收藏 | `favorites/index/index.js` | `GET /api/users/me/favorites?targetType=` |
| 我的评论 | `comments/index/index.js` | `GET /api/users/me/comments` |
| 我的上传 | `uploads/index/index.js` | `GET /api/users/me/uploads` |

**改动要点**:
- 登录页接入 `POST /api/auth/login`（`wx.login()` → code → token）
- 个人主页实时同步 `app.globalData.userInfo`
- 退出登录清除 token 和本地存储

### 4.9 其他页面（4 页）

| 页面 | 文件 | 接入 API |
|------|------|---------|
| 全局搜索 | `search/index/index.js` | `GET /api/search?type=&keyword=` |
| 消息通知 | `notification/index/index.js` | `GET /api/notifications` + `POST /api/notifications/:id/read` |
| 帮助反馈 | `help/index/index.js` | `POST /api/feedback` |
| 关于 | `about/index/index.js` | 静态页，版本号已更新为 v0.2.1 |

---

## 五、服务器部署

### 部署环境
- **服务器**: `www.yjjyzxy.top`（Ubuntu 22.04 + 宝塔面板）
- **Node.js**: v20.15.0（宝塔 Node 项目管理器）
- **MySQL**: 数据库 `rescue_camp`，用户 `rescue_camp`
- **进程管理**: 宝塔 Node 项目管理器（端口 3000）
- **反向代理**: Nginx（`/api/*` → `127.0.0.1:3000`，`/admin/*` → `127.0.0.1:3000`）

### 部署步骤
1. 配置 `.env`：数据库连接、JWT 密钥、微信 AppID/Secret
2. 上传 `server/` 到 `/www/wwwroot/yjjyzxy.top/server/`
3. `npm install --production` → `prisma generate` → `prisma db push` → `prisma db seed`
4. 宝塔 Node 项目：启动文件 `src/server.js`，端口 3000
5. Nginx 反向代理配置
6. 验证 `https://www.yjjyzxy.top/api/health` 返回 200

### 验证结果
- ✅ `GET /api/health` → 200
- ✅ `GET /admin/login` → 200（管理后台可登录）
- ✅ 微信公众平台已添加 `https://www.yjjyzxy.top` 为合法域名

---

## 六、版本号同步

| 位置 | 版本号 |
|------|--------|
| `project.config.json` | 0.2.1 |
| `server/package.json` | 0.2.1 |
| `pages/about/index/index.js` | v0.2.1 |
| `docs/log/everything.md` | 0.2.1 |

---

## 七、设计原则

1. **所有页面保留 fallback 数据** — API 不可用时页面不白屏，降级展示默认内容
2. **静默容错** — API 调用失败不阻断页面渲染，`catch` 中静默处理
3. **分页加载** — 列表页全部支持 `onReachBottom` 下拉加载更多
4. **Token 管理** — 统一通过 `utils/request.js` 注入，401 自动清除并提示重新登录
5. **与后端数据结构对齐** — 前端数据格式完全适配后端 API 响应格式

---

### 相关文件
- 所有 `miniprogram/pages/**/*.js`（28 个文件）
- `miniprogram/config/index.js`（新增）
- `miniprogram/utils/request.js`（新增）
- `miniprogram/utils/util.js`（新增）
- `miniprogram/app.js`（修改）
- `server/src/utils/sensitiveFilter.js`（修复）
- `server/prisma/seed.js`（扩充）
- `server/.env`（配置）

### 注意事项
- 微信登录依赖 `wx.login()` 获取真实 code，开发者工具模拟器可能失败，需真机测试
- 文件上传功能需真机测试（开发者工具模拟 `wx.chooseMedia` 可能不完整）
- 部分页面（如 `tools/index`、`settings/index`、`shop/index`、`certification/index`）为纯静态页，无需 API 接入
