# 应急救援战训营 — 完整需求文档

> **版本**：v1.0  
> **日期**：2026-06-25  
> **状态**：前端框架完成（36页），后端待开发  
> **服务器**：www.yjjyzxy.top（宝塔面板）

---

## 目录

- [一、项目概述](#一项目概述)
- [二、用户角色](#二用户角色)
- [三、前端需求详情](#三前端需求详情)
- [四、后端需求详情](#四后端需求详情)
- [五、数据库设计](#五数据库设计)
- [六、API 接口清单](#六api-接口清单)
- [七、非功能性需求](#七非功能性需求)
- [八、开发路线图](#八开发路线图)

---

## 一、项目概述

### 1.1 项目定位

**应急救援战训营**是一个面向消防救援人员的微信小程序培训平台。提供视频学习、战训工具、训练操法、器材管理、刷题考核、社区论坛、装备商城、个人中心等功能。

### 1.2 目标用户

- 消防救援一线人员（主要用户）
- 消防指挥员/教官
- 应急救援相关从业人员
- 消防培训学员

### 1.3 核心价值

1. **系统化培训**：视频课程 + 答题考核 + 操法训练，形成完整学习闭环
2. **实战工具**：危化品快速查询、考核标准查询、安全计算器等，辅助一线决策
3. **社区交流**：论坛分享实战经验、技术讨论
4. **装备管理**：器材装备的信息化管理

### 1.4 技术栈

| 层级 | 技术选型 |
|------|---------|
| 前端 | 微信小程序原生（WXML + WXSS + JS） |
| 后端（建议） | Node.js (Express) 或 PHP (ThinkPHP)，运行于宝塔面板 |
| 数据库（建议） | MySQL 5.7+ |
| 缓存（建议） | Redis（可选，用于会话/热点数据） |
| 文件存储 | 服务器本地存储 + 腾讯云 COS（可选） |
| 云服务 | 微信云开发（当前已初始化） |

---

## 二、用户角色

| 角色 | 权限 | 说明 |
|------|------|------|
| 游客 | 浏览部分内容 | 未登录状态，可看首页推荐 |
| 普通用户 | 浏览、评论、收藏、答题 | 微信授权登录后的默认角色 |
| 认证用户 | 普通用户 + 发帖、上传视频 | 通过身份认证（消防从业人员） |
| 管理员 | 全部权限 + 审核、管理 | 后台管理用户/内容/数据 |

---

## 三、前端需求详情

### 3.1 首页 `pages/index/index`

**当前状态**：✅ 已完成（静态数据）

**功能需求**：
- Banner 轮播（3 张，自动切换 4s，循环）
- 功能网格 3×2（6 个模块入口）
- "为您推荐"区块（大图卡片 + 横向列表）
- 搜索栏（全局搜索入口）

**待接入 API**：
- `GET /api/banners` — 轮播图数据
- `GET /api/recommends` — 推荐内容
- `GET /api/categories` — 功能模块配置

---

### 3.2 视频学习 `pages/video/*`

**当前状态**：✅ 框架完成 / ⚠️ 需接入真实视频

**页面清单**：
| 页面 | 路径 | 功能 |
|------|------|------|
| 视频分类 | `video/index` | 8 类灾害分类入口（火灾/地震/水域/绳索/车辆事故/危化品/石油化工/山岳救援）|
| 分类详情 | `video/category` | 搜索框 + 筛选标签 + 视频列表 |
| 视频播放 | `video/play` | 视频播放器 + 简介 + 相关推荐 |

**详细需求**：

1. **视频分类页** (`video/index`)
   - 8 类灾害模块，每个占满一行（单列布局）
   - 每行显示：分类图标 + 名称 + 箭头
   - 点击进入对应分类详情

2. **分类详情页** (`video/category`)
   - 搜索框：支持按标题/作者/标签搜索
   - 筛选标签：全部 / 最新发布 / 最多播放 / 免费课程 / 积分课程
   - 视频列表卡片：缩略图（含播放按钮 + 时长角标 + 积分角标）+ 标题 + 作者 + 播放量 + 标签
   - 空状态提示

3. **视频播放页** (`video/play`)
   - ⚠️ 替换占位 `<view>` 为 `<video>` 组件
   - 视频信息：标题、播放量、时长、发布日期、标签
   - 作者信息：头像、昵称、等级、关注按钮
   - 简介展开/收起
   - 相关推荐列表

**待接入 API**：
- `GET /api/videos?categoryId=X&keyword=X&filter=X&page=X&pageSize=X` — 视频列表
- `GET /api/videos/:id` — 视频详情（含播放地址）
- `POST /api/videos/:id/view` — 记录播放量

---

### 3.3 战训工具 `pages/tools/*`

**当前状态**：✅ 框架完成

**页面清单**：
| 页面 | 路径 | 功能 |
|------|------|------|
| 工具主页 | `tools/index` | 4 大工具卡片 2×2 网格 + 快捷工具 |
| 危化品查询 | `tools/chemical` | 搜索 + 分类标签 + 危化品列表 |
| 危化品详情 | `tools/chemical-detail` | 完整信息卡片 |
| 考核标准 | `tools/standard` | 搜索 + 分类 + 标准列表 |
| 标准详情 | `tools/standard-detail` | 考核标准完整信息 |

**详细需求**：

1. **工具主页** (`tools/index`)
   - 4 张 Hero 卡片，2 列 × 2 行布局
   - 卡片：危化品查询、火灾扑救要点、抢险救援要点、体能标准
   - 后 3 张标记"即将上线"或接入真实内容

2. **危化品查询** (`tools/chemical`)
   - 搜索栏 + 8 分类标签（横向滚动）
   - 分类联动过滤 + 关键词联动过滤
   - 列表项：UN编号 + 名称 + 分子式 + 危险类别色标

3. **危化品详情** (`tools/chemical-detail`)
   - 理化性质每行 2 个（如"分子量"和"沸点"同行）
   - 信息模块：UN信息 → 理化性质 → 危险性 → 处置要点 → 防护措施

4. **考核标准** (`tools/standard` + `standard-detail`)
   - 分类：全部/体能考核/技能考核/理论考核/综合考核
   - 详情：适用对象/考核项目/合格标准/评分细则

**待接入 API**：
- `GET /api/chemicals?keyword=X&category=X&page=X` — 危化品列表
- `GET /api/chemicals/:id` — 危化品详情
- `GET /api/standards?keyword=X&category=X&page=X` — 考核标准列表
- `GET /api/standards/:id` — 考核标准详情

---

### 3.4 训练操法 `pages/training/*`

**当前状态**：✅ 框架完成

**页面清单**：
| 页面 | 路径 | 功能 |
|------|------|------|
| 操法列表 | `training/index` | 精选推荐 + 2 列操法网格 + 学习进度 |
| 操法详情 | `training/detail` | 操法步骤 + 装备清单 + 教学视频 |

**详细需求**：
- 搜索 + 5 分类筛选（全部操法/灭火操法/救人操法/体能竞技/装备应用）
- 精选推荐大图卡片（跨 2 列）
- 常规卡片 2 列网格
- 学习进度圆环（动态计算完成百分比）

**待接入 API**：
- `GET /api/trainings?keyword=X&category=X&page=X` — 训练操法列表
- `GET /api/trainings/:id` — 操法详情
- `POST /api/trainings/:id/progress` — 更新学习进度

---

### 3.5 器材装备 `pages/equipment/*`

**页面清单**：
| 页面 | 路径 | 功能 |
|------|------|------|
| 装备列表 | `equipment/index` | 左侧分类边栏 + 右侧列表 + FAB |
| 装备详情 | `equipment/detail` | 规格参数 + 使用说明 + 报修/领用 |

**详细需求**：
- 分类边栏：基础/特种/破拆/药剂/急救/侦检（6类）
- 分类 + 关键词联动过滤
- 列表/网格双视图切换
- 详情：规格参数表 + 使用说明 + 适用场景 + 操作规程 + 维护保养
- 报修/领用按钮

**待接入 API**：
- `GET /api/equipment?category=X&keyword=X&page=X` — 装备列表
- `GET /api/equipment/:id` — 装备详情
- `POST /api/equipment/:id/repair` — 报修申请
- `POST /api/equipment/:id/requisition` — 领用申请

---

### 3.6 拓展学习 `pages/learning/*`

**页面清单**：
| 页面 | 路径 | 功能 |
|------|------|------|
| 学习列表 | `learning/index` | 视频卡片流 + 资料库卡片 |
| 学习详情 | `learning/detail` | 视频/资料详细内容 |

**待接入 API**：
- `GET /api/learning?category=X&type=video|doc&page=X` — 拓展学习列表
- `GET /api/learning/:id` — 学习内容详情

---

### 3.7 刷题中心 `pages/quiz/*`

**页面清单**：
| 页面 | 路径 | 功能 |
|------|------|------|
| 题库列表 | `quiz/index` | 分类标签 + 题库列表 |
| 答题页 | `quiz/detail` | 题目 + 选项 + 解析 + 答题卡 |
| 结果页 | `quiz/result` | 得分统计 + 错题本 |

**详细需求**：
- 7 分类：全部/作战训练安全/灭火救援/晋级考核/职业技能鉴定/水域救援/绳索救援
- 答题逻辑：选选项 → 判断正误 → 显示解析 → 下一题
- 答题卡：10×10 网格，灰色=未做，绿色=已做
- 交卷→结果页：分数、正确率、错题回顾

**待接入 API**：
- `GET /api/quiz/banks?category=X` — 题库列表
- `GET /api/quiz/banks/:id/questions?page=X` — 题目列表
- `POST /api/quiz/submit` — 提交答题记录
- `GET /api/quiz/records?userId=X` — 答题历史/错题本

---

### 3.8 论坛 `pages/forum/*`

**当前状态**：✅ 框架完成（含帖子详情页）

**页面清单**：
| 页面 | 路径 | 功能 |
|------|------|------|
| 论坛主页 | `forum/index` | 搜索 + 签到 + 筛选 + 帖子列表 + FAB |
| 帖子详情 | `forum/detail` | 完整内容 + 评论区 + 回复 + 相关推荐 |
| 发帖页 | `forum/post` | 类型切换 + 上传 + 标签 + 积分设置 |

**详细需求**：

1. **论坛主页** (`forum/index`)
   - 签到功能（状态切换 + 积分 +5）
   - 4 筛选标签：最新 / 热门 / 精华 / 资源
   - 帖子列表 4 种卡片：视频帖/图文帖/多图帖/纯文本帖
   - FAB 发帖按钮

2. **帖子详情** (`forum/detail`)
   - 作者信息：头像 + 昵称 + 等级 + 关注按钮
   - 帖子内容：标题 + 标签 + 正文 + 图片/视频 + 互动数据
   - 互动操作：点赞 / 收藏 / 分享
   - 评论区：评论列表 + 子回复 + 点赞评论 + 热度/时间排序
   - 评论输入弹层（支持回复特定用户）
   - 相关帖子推荐

3. **发帖页** (`forum/post`)
   - 类型切换：视频 / 资料 / 课件
   - 上传区域（`wx.chooseMedia`）
   - 标题 + 正文
   - 积分设置：0/2/5/8/自定义
   - 分类标签（预设 + 自定义，最多 5 个）
   - 协议确认 checkbox

**待接入 API**：
- `GET /api/posts?tab=X&page=X` — 帖子列表
- `GET /api/posts/:id` — 帖子详情
- `POST /api/posts` — 发布帖子
- `POST /api/posts/:id/like` — 点赞/取消点赞
- `POST /api/posts/:id/favorite` — 收藏/取消收藏
- `GET /api/posts/:id/comments?sort=hot|new&page=X` — 评论列表
- `POST /api/comments` — 发表评论/回复
- `POST /api/comments/:id/like` — 评论点赞
- `POST /api/users/signin` — 签到
- `GET /api/notifications` — 消息通知列表

---

### 3.9 商城 `pages/shop/*`

**页面清单**：
| 页面 | 路径 | 功能 |
|------|------|------|
| 商城主页 | `shop/index` | Hero + 分类 + 热门商品 |
| 商品详情 | `shop/detail` | 轮播图 + 规格 + 评价 + 加购/购买 |
| 购物车 | `shop/cart` | 分组商品 + 全选 + 数量 + 结算 |
| 确认订单 | `shop/order` | 地址 + 配送 + 价格汇总 + 提交 |

**待接入 API**：
- `GET /api/products?category=X&page=X` — 商品列表
- `GET /api/products/:id` — 商品详情
- `POST /api/cart/add` — 加入购物车
- `GET /api/cart` — 购物车列表
- `PUT /api/cart/:id` — 更新购物车（数量/选中）
- `POST /api/orders` — 创建订单
- `GET /api/orders?status=X` — 订单列表
- `POST /api/orders/:id/pay` — 发起支付（微信支付）

---

### 3.10 个人中心 `pages/profile/*`

**页面清单**：
| 页面 | 路径 | 功能 |
|------|------|------|
| 个人主页 | `profile/index` | 用户信息 + 菜单入口 |
| 编辑资料 | `profile/edit` | 修改头像/昵称等 |
| 登录授权 | `login/index` | 微信一键登录 |
| 我的收藏 | `favorites/index` | 收藏列表 |
| 我的评论 | `comments/index` | 评论历史 |
| 我的上传 | `uploads/index` | 上传记录 |
| 设置 | `settings/index` | 系统设置 |
| 关于 | `about/index` | 关于信息 |
| 帮助反馈 | `help/index` | 帮助 + 反馈 |
| 职业技能鉴定 | `certification/index` | 鉴定信息 |

**待接入 API**：
- `POST /api/auth/login` — 微信登录（code → token）
- `GET /api/users/me` — 获取当前用户信息
- `PUT /api/users/me` — 更新用户资料
- `GET /api/users/me/favorites?page=X` — 我的收藏
- `GET /api/users/me/comments?page=X` — 我的评论
- `GET /api/users/me/uploads?page=X` — 我的上传
- `POST /api/feedback` — 提交反馈

---

### 3.11 全局功能

| 页面 | 路径 | 功能 |
|------|------|------|
| 全局搜索 | `search/index` | 4Tab 分类搜索（课程/帖子/商品/装备）|
| 消息通知 | `notification/index` | 通知列表（评论/点赞/系统消息）|

---

## 四、后端需求详情

### 4.1 架构要求

- **运行环境**：宝塔面板（已安装于 www.yjjyzxy.top）
- **建议框架**：Node.js (Express/Koa) 或 PHP (ThinkPHP/Laravel)
- **数据库**：MySQL 5.7+（宝塔面板可一键安装）
- **API 风格**：RESTful，JSON 格式返回
- **API 基地址**：`https://www.yjjyzxy.top/api`

### 4.2 核心模块

#### 4.2.1 用户与认证

```
POST   /api/auth/login         微信登录（code 换 token）
GET    /api/users/me           获取当前用户信息
PUT    /api/users/me           更新用户资料
POST   /api/users/signin       每日签到
GET    /api/users/me/progress  学习进度统计
```

**登录流程**：
1. 小程序端调用 `wx.login()` 获取 code
2. 将 code 发送到后端 `/api/auth/login`
3. 后端用 code 请求微信接口获取 openid/session_key
4. 查找或创建用户记录，生成 JWT token 返回
5. 前端存储 token，后续请求在 Header 携带 `Authorization: Bearer <token>`

#### 4.2.2 内容管理（视频/课程/操法/学习）

```
GET    /api/videos             视频列表（支持分类/关键词/筛选/分页）
GET    /api/videos/:id         视频详情
GET    /api/trainings          训练操法列表
GET    /api/trainings/:id      操法详情
GET    /api/learning           拓展学习列表
GET    /api/learning/:id       学习内容详情
```

#### 4.2.3 战训工具

```
GET    /api/chemicals          危化品列表（搜索+分类+分页）
GET    /api/chemicals/:id      危化品详情
GET    /api/standards          考核标准列表
GET    /api/standards/:id      考核标准详情
GET    /api/equipment          器材装备列表
GET    /api/equipment/:id      装备详情
POST   /api/equipment/:id/repair   报修申请
POST   /api/equipment/:id/requisition 领用申请
```

#### 4.2.4 刷题系统

```
GET    /api/quiz/banks              题库列表
GET    /api/quiz/banks/:id/questions 题目列表（分页）
POST   /api/quiz/submit             提交答题记录
GET    /api/quiz/records             答题历史
GET    /api/quiz/records/wrong       错题本
```

**答题提交数据结构**：
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

#### 4.2.5 论坛/社区

```
GET    /api/posts              帖子列表（tab: latest/hot/essence/resource）
GET    /api/posts/:id          帖子详情
POST   /api/posts              发布帖子
DELETE /api/posts/:id          删除帖子
POST   /api/posts/:id/like     点赞/取消
POST   /api/posts/:id/favorite 收藏/取消
GET    /api/posts/:id/comments 评论列表
POST   /api/comments           发表评论/回复
DELETE /api/comments/:id       删除评论
POST   /api/comments/:id/like  评论点赞
```

#### 4.2.6 商城

```
GET    /api/products           商品列表
GET    /api/products/:id       商品详情
POST   /api/cart/add           加入购物车
GET    /api/cart               获取购物车
PUT    /api/cart/:id           更新购物车项
DELETE /api/cart/:id           删除购物车项
POST   /api/orders             创建订单
GET    /api/orders             订单列表
GET    /api/orders/:id         订单详情
POST   /api/orders/:id/pay     发起支付
```

#### 4.2.7 文件上传

```
POST   /api/upload/image       上传图片
POST   /api/upload/video       上传视频
POST   /api/upload/file        上传文件（PDF/DOCX等）
```

**要求**：
- 图片格式：jpg/png/gif/webp，单文件 ≤ 10MB
- 视频格式：mp4/mov，单文件 ≤ 500MB
- 支持进度回调

#### 4.2.8 其他

```
GET    /api/banners            首页 Banner 列表
GET    /api/recommends         首页推荐内容
GET    /api/notifications      消息通知列表
POST   /api/notifications/:id/read  标记已读
POST   /api/feedback           提交反馈
GET    /api/search             全局搜索（type: video/post/product/equipment）
```

---

## 五、数据库设计

### 5.1 核心表清单

| 表名 | 说明 | 主要字段 |
|------|------|---------|
| `users` | 用户表 | id, openid, nickname, avatar, phone, level, points, role, status, created_at |
| `categories` | 分类表 | id, name, type(video/training/chemical...), parent_id, sort |
| `videos` | 视频表 | id, title, category_id, cover_url, video_url, duration, author, views, likes, tags, points, status, created_at |
| `trainings` | 训练操法表 | id, title, category_id, cover_url, steps(JSON), equipment(JSON), cautions, video_url, created_at |
| `chemicals` | 危化品表 | id, name, formula, un_number, hazard_class, hazard_color, properties(JSON), dangers(JSON), steps(JSON), protections(JSON) |
| `equipment` | 器材装备表 | id, name, model, category_id, status, specs(JSON), usage, maintenance, created_at |
| `quiz_banks` | 题库表 | id, title, category_id, icon, question_count, created_at |
| `quiz_questions` | 题目表 | id, bank_id, type(single/multi/judge), question, options(JSON), correct_answer, explanation |
| `quiz_records` | 答题记录表 | id, user_id, bank_id, score, total, answers(JSON), duration, created_at |
| `posts` | 帖子表 | id, user_id, title, content, type(video/image/text), images(JSON), video_url, tags(JSON), points, views, likes, comments_count, is_essence, status, created_at |
| `comments` | 评论表 | id, user_id, post_id, parent_id, reply_to_uid, content, likes, created_at |
| `products` | 商品表 | id, name, category_id, images(JSON), price, original_price, specs(JSON), stock, sales, created_at |
| `orders` | 订单表 | id, user_id, order_no, items(JSON), total_amount, status, address(JSON), created_at |
| `favorites` | 收藏表 | id, user_id, target_type, target_id, created_at |
| `likes` | 点赞表 | id, user_id, target_type, target_id, created_at |
| `notifications` | 通知表 | id, user_id, type, content, target_type, target_id, is_read, created_at |
| `sign_records` | 签到表 | id, user_id, sign_date, points, created_at |
| `banners` | 轮播图表 | id, title, image_url, link_url, sort, status |
| `feedbacks` | 反馈表 | id, user_id, content, images(JSON), contact, created_at |

### 5.2 关键设计原则

1. **软删除**：内容类表使用 `status` 字段（1=正常 0=删除），而非物理删除
2. **JSON 字段**：灵活数据结构（如危化品属性、商品规格）使用 JSON 类型存储
3. **索引优化**：高频查询字段（category_id, user_id, status, created_at）建索引
4. **分页**：列表接口统一使用 `page` + `pageSize` 参数，默认 pageSize=20
5. **点击数/播放量**：高频更新字段可考虑 Redis 计数 + 定时同步到 MySQL

---

## 六、API 接口清单（汇总）

### 6.1 通用规范

- **Base URL**：`https://www.yjjyzxy.top/api`
- **认证方式**：JWT Token，Header `Authorization: Bearer <token>`
- **响应格式**：

```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

- **错误码**：

| code | 含义 |
|------|------|
| 0 | 成功 |
| 401 | 未登录/token过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 422 | 参数校验失败 |
| 500 | 服务器错误 |

- **分页响应**：

```json
{
  "code": 0,
  "data": {
    "list": [],
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 6.2 完整接口表

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | POST | `/api/auth/login` | 否 | 微信登录 |
| 2 | GET | `/api/users/me` | 是 | 个人信息 |
| 3 | PUT | `/api/users/me` | 是 | 更新资料 |
| 4 | POST | `/api/users/signin` | 是 | 签到 |
| 5 | GET | `/api/banners` | 否 | Banner列表 |
| 6 | GET | `/api/recommends` | 否 | 推荐内容 |
| 7 | GET | `/api/videos` | 否 | 视频列表 |
| 8 | GET | `/api/videos/:id` | 否 | 视频详情 |
| 9 | POST | `/api/videos/:id/view` | 否 | 记录播放 |
| 10 | GET | `/api/trainings` | 否 | 操法列表 |
| 11 | GET | `/api/trainings/:id` | 否 | 操法详情 |
| 12 | POST | `/api/trainings/:id/progress` | 是 | 学习进度 |
| 13 | GET | `/api/chemicals` | 否 | 危化品列表 |
| 14 | GET | `/api/chemicals/:id` | 否 | 危化品详情 |
| 15 | GET | `/api/standards` | 否 | 考核标准列表 |
| 16 | GET | `/api/standards/:id` | 否 | 标准详情 |
| 17 | GET | `/api/equipment` | 是 | 装备列表 |
| 18 | GET | `/api/equipment/:id` | 是 | 装备详情 |
| 19 | POST | `/api/equipment/:id/repair` | 是 | 报修 |
| 20 | POST | `/api/equipment/:id/requisition` | 是 | 领用 |
| 21 | GET | `/api/learning` | 否 | 拓展学习列表 |
| 22 | GET | `/api/learning/:id` | 否 | 学习详情 |
| 23 | GET | `/api/quiz/banks` | 否 | 题库列表 |
| 24 | GET | `/api/quiz/banks/:id/questions` | 是 | 题目列表 |
| 25 | POST | `/api/quiz/submit` | 是 | 提交答题 |
| 26 | GET | `/api/quiz/records` | 是 | 答题历史 |
| 27 | GET | `/api/quiz/records/wrong` | 是 | 错题本 |
| 28 | GET | `/api/posts` | 否 | 帖子列表 |
| 29 | GET | `/api/posts/:id` | 否 | 帖子详情 |
| 30 | POST | `/api/posts` | 是 | 发帖 |
| 31 | DELETE | `/api/posts/:id` | 是 | 删帖 |
| 32 | POST | `/api/posts/:id/like` | 是 | 点赞帖子 |
| 33 | POST | `/api/posts/:id/favorite` | 是 | 收藏帖子 |
| 34 | GET | `/api/posts/:id/comments` | 否 | 评论列表 |
| 35 | POST | `/api/comments` | 是 | 发表评论 |
| 36 | DELETE | `/api/comments/:id` | 是 | 删除评论 |
| 37 | POST | `/api/comments/:id/like` | 是 | 评论点赞 |
| 38 | GET | `/api/products` | 否 | 商品列表 |
| 39 | GET | `/api/products/:id` | 否 | 商品详情 |
| 40 | POST | `/api/cart/add` | 是 | 加入购物车 |
| 41 | GET | `/api/cart` | 是 | 购物车 |
| 42 | PUT | `/api/cart/:id` | 是 | 更新购物车 |
| 43 | DELETE | `/api/cart/:id` | 是 | 删除购物车项 |
| 44 | POST | `/api/orders` | 是 | 创建订单 |
| 45 | GET | `/api/orders` | 是 | 订单列表 |
| 46 | GET | `/api/orders/:id` | 是 | 订单详情 |
| 47 | POST | `/api/orders/:id/pay` | 是 | 发起支付 |
| 48 | POST | `/api/upload/image` | 是 | 上传图片 |
| 49 | POST | `/api/upload/video` | 是 | 上传视频 |
| 50 | POST | `/api/upload/file` | 是 | 上传文件 |
| 51 | GET | `/api/notifications` | 是 | 通知列表 |
| 52 | POST | `/api/notifications/:id/read` | 是 | 标记已读 |
| 53 | GET | `/api/search` | 否 | 全局搜索 |
| 54 | POST | `/api/feedback` | 是 | 提交反馈 |
| 55 | GET | `/api/users/me/favorites` | 是 | 我的收藏 |
| 56 | GET | `/api/users/me/comments` | 是 | 我的评论 |
| 57 | GET | `/api/users/me/uploads` | 是 | 我的上传 |

---

## 七、非功能性需求

### 7.1 性能

| 指标 | 目标值 |
|------|--------|
| 首屏加载 | < 2s（4G 网络） |
| API 响应时间 | < 500ms（P95） |
| 图片加载 | 使用 CDN + webp 格式 + 缩略图 |
| 视频播放 | 支持分段加载、清晰度切换 |
| 并发支持 | 1000 QPS（峰值） |

### 7.2 安全

- [ ] 接口防刷（频率限制）
- [ ] 内容审核（敏感词过滤）
- [ ] SQL 注入防护（参数化查询）
- [ ] XSS 防护（输入过滤 + 输出转义）
- [ ] HTTPS 强制（已配置）
- [ ] 文件上传校验（类型 + 大小 + 病毒扫描）
- [ ] JWT token 过期策略（access_token 2h + refresh_token 7d）

### 7.3 数据

- [ ] 定期数据库备份（宝塔面板定时任务）
- [ ] 日志记录（API 请求日志、错误日志）
- [ ] 数据统计（播放量、活跃用户、答题通过率等）

### 7.4 运维

- [ ] 宝塔面板管理（Nginx 配置、SSL 证书自动续期）
- [ ] 部署脚本/CI（Git push → 自动拉取 → 重启服务）
- [ ] 健康检查接口 `GET /api/health`

---

## 八、开发路线图

### 阶段一：后端 MVP（1-2 周）

- [ ] 搭建 Node.js/PHP 项目框架
- [ ] 数据库建表
- [ ] 用户登录/注册 API
- [ ] 视频列表/详情 API
- [ ] 危化品查询 API
- [ ] 论坛帖子列表/详情/评论 API
- [ ] API 文档（Swagger/Apifox）

### 阶段二：前后端联调（1-2 周）

- [ ] 首页数据接入（Banner + 推荐）
- [ ] 视频模块完整接入（分类/列表/播放）
- [ ] 战训工具接入（危化品/考核标准）
- [ ] 论坛完整功能（发帖/评论/点赞/收藏）
- [ ] 刷题系统（答题/交卷/错题本）

### 阶段三：高级功能（1-2 周）

- [ ] 商城完整流程（购物车/下单/支付）
- [ ] 用户中心全部功能
- [ ] 文件上传（图片/视频）
- [ ] 消息推送（评论/点赞通知）
- [ ] 内容审核

### 阶段四：优化与上线（1 周）

- [ ] 性能优化（缓存/CDN）
- [ ] 安全审计
- [ ] 真机全面测试
- [ ] 小程序提交审核

---

## 附录 A：当前技术债务

| 项目 | 优先级 | 说明 |
|------|--------|------|
| 接入真实 API | 🔴 高 | 36 页全部使用静态 mock 数据 |
| `<video>` 组件集成 | 🔴 高 | 视频播放页为占位 `<view>` |
| 微信登录 | 🔴 高 | 当前为模拟登录 |
| 论坛发帖上传 | 🟡 中 | `wx.chooseMedia` + 云存储 |
| 商城支付 | 🟡 中 | 微信支付接入 |
| 图片资源替换 | 🟢 低 | Emoji + 渐变色替代实际图片 |
| 真机测试 | 🔴 高 | 所有功能需真机验证 |

## 附录 B：本次改动（2026-06-25）

| # | 改动内容 | 影响文件 |
|---|---------|---------|
| 1 | 视频分类网格 2列→单列满行（加图标+箭头+渐变色） | `video/index.*` |
| 2 | 新建视频分类详情页（搜索+筛选+视频列表） | `video/category.*` (新增4文件) + `app.json` |
| 3 | 战训工具 Hero卡片 1列→2列网格 | `tools/index.*` |
| 4 | 危化品详情理化性质确认为2列（无需改动） | — |
| 5 | 论坛帖子详情页完整实现（内容+评论+回复+推荐） | `forum/detail.*` (4文件重写) |
| 6 | 编写完整需求文档 | `docs/REQUIREMENTS.md` (新增) |
