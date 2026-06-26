# 前端页面框架 改动记录

## 0.0.1 - 2026-06-25

### 改动类型: 新增

#### 改动内容

**1. 项目初始化**
- 配置 `app.json`：注册 21 个页面路由 + 4项 TabBar（首页/论坛/商城/我的）
- 重写 `app.js`：添加 `globalData.statusBarHeight`（自定义导航栏所需）
- 重写 `app.wxss`：全局设计系统

**2. 全局样式系统（app.wxss）**
- 定义 CSS 颜色变量（消防红 #E60012、救援蓝 #005BAC 等 12 个颜色令牌）
- 定义间距/字体/圆角变量
- 提供 60+ 个全局工具类：`.flex` / `.card` / `.btn` / `.tag` / `.grid-2` / `.text-*` / `.mt-*` 等
- 全局 `box-sizing: border-box` 修复布局溢出

**3. 4个 TabBar 主页面**

| 页面 | 核心功能 |
|------|---------|
| `pages/index/index` | Banner轮播(3张) + 功能网格(3×2) + 推荐内容(大图+列表) |
| `pages/forum/index` | 签到 + 积分横幅 + 筛选标签 + 帖子列表(4种类型) + 发帖FAB |
| `pages/shop/index` | Hero横幅 + 分类网格(2×2) + 热门商品 + 购物车/订单入口 |
| `pages/profile/index` | 用户卡片(未登录/已登录状态切换) + 3组菜单 + 退出登录 |

**4. 17个子页面**

*论坛子页：*
- `pages/forum/post` — 发布帖子（类型切换 + 标签 + 积分设置 + 上传区 + 分类 + 协议确认）

*商城子页：*
- `pages/shop/cart` — 购物车（商品列表 + 数量步进器 + 猜你喜欢 + 结算栏）
- `pages/shop/order` — 确认订单（地址 + 商品清单 + 优惠积分 + 价格汇总 + 提交按钮）
- `pages/shop/detail` — 商品详情（轮播图 + 规格/特性手风琴 + 评价 + 加购/购买）

*功能区子页（6个模块，共 12 个页面）：*
- `pages/video/index` + `play` — 视频学习（8类灾害网格 + 播放页）
- `pages/tools/index` + `chemical` + `chemical-detail` + `standard` + `standard-detail` — 战训工具
- `pages/training/index` — 训练操法（精选大图 + 2列网格 + 进度圆环）
- `pages/equipment/index` + `detail` — 器材装备（侧边栏分类 + 列表 + 详情）
- `pages/learning/index` — 拓展学习（视频流 + 资料库 + 趋势网格）
- `pages/quiz/index` + `detail` — 刷题中心（题库列表 + 答题卡 + 统计）

**5. 图标方案**
- 将 HTML 设计稿中的 Material Icons 和 `&#XXXX;` 实体全部替换为 Unicode Emoji 字符
- 共替换 89 处，涵盖 20+ 种图标（🔍☰←⭐👤▶🔔🛒📦💬📖👁🌍等）

**6. 布局修复**
- 全局添加 `box-sizing: border-box`
- 22 个页面 WXSS 文件添加 `width: 100%` 和 `box-sizing` 声明
- 装备页面侧边栏限制 `max-width: 160rpx`
- 网格/卡片容器显式设置全宽

**7. 文档**
- 创建 `PAGES.md`：项目前端页面全景文档（供 AI 快速理解项目结构）
- 创建 `docs/log/everything.md`：改动汇总日志
- 创建 `docs/log/feature-frontend-pages.md`：本详细日志

#### 影响范围
- 全部 `miniprogram/pages/` 目录（21个页面目录）
- `miniprogram/app.json`（页面路由 + TabBar 配置）
- `miniprogram/app.js`（全局数据）
- `miniprogram/app.wxss`（全局样式）
- 新增 `PAGES.md`（项目根目录）
- 新增 `docs/log/` 目录

#### 改动原因
- 项目启动阶段，需要将 UI 设计稿（HTML预览）转换为可运行的微信小程序前端
- 原设计稿使用 Tailwind CSS + Material Icons + 外部图片，需适配小程序原生环境
- HTML 实体在 WXML 中无法解析，需替换为实际 Unicode 字符
- 多页面存在 `box-sizing` 缺失导致的宽度折行问题

#### 相关文件
- `miniprogram/app.json` — 页面路由注册、TabBar 配置
- `miniprogram/app.js` — 全局数据（statusBarHeight）
- `miniprogram/app.wxss` — 全局设计系统（色彩/间距/字体/工具类）
- `miniprogram/pages/index/*` — 首页（Banner + 功能网格 + 推荐）
- `miniprogram/pages/forum/*` — 论坛（列表 + 发帖）
- `miniprogram/pages/shop/*` — 商城（主页 + 购物车 + 订单 + 详情）
- `miniprogram/pages/profile/*` — 个人中心
- `miniprogram/pages/video/*` — 视频学习
- `miniprogram/pages/tools/*` — 战训工具（5个页面）
- `miniprogram/pages/training/*` — 训练操法
- `miniprogram/pages/equipment/*` — 器材装备
- `miniprogram/pages/learning/*` — 拓展学习
- `miniprogram/pages/quiz/*` — 刷题中心
- `PAGES.md` — 前端页面文档

#### 测试验证
- 微信开发者工具中可正常预览所有页面
- 所有页面间导航跳转无报错
- Unicode 图标正常显示，无乱码
- 页面布局占满屏幕宽度，无半屏问题
- 待真机验证（需微信开发者工具扫码预览）

#### 注意事项
- 当前所有数据均为静态示例数据（写在各页面 `.js` 的 `data` 中），后续需接入真实 API
- 视频播放为占位符（暗色背景 + 播放按钮），需集成 `<video>` 组件或第三方播放器
- 部分设计稿中的背景图片使用渐变色替代，后续可替换为真实素材
- 用户登录为模拟状态切换（`toggleLogin()`），需接入微信授权登录
- 商城"加入购物车"使用 `wx.setStorageSync` 模拟，未对接后端
- 版本号当前为 0.0.1，后续功能迭代需按 CLAUDE.md 规则递增


## 0.0.2 - 2026-06-25

### 改动类型: 修复

#### 改动内容

**1. 余留 HTML 实体修复（14 处）**

第一轮修复（0.0.1）中遗漏了 JS 数据定义中的 HTML 实体，导致 WXML 渲染时显示原始字符编码文本。

| 文件 | 数量 | 示例 |
|------|------|------|
| `pages/training/index.js` | 4 处 | `&#128293;` → `🔥`, `&#9968;` → `⛰️` |
| `pages/equipment/index.js` | 9 处 | `&#128736;` → `🔧`, `&#127973;` → `🏥` |
| `pages/equipment/detail.js` | 1 处 | `&#128736;` → `🔧` |
| `pages/shop/detail.js` | 1 处 | `&#x1F468;` → `👨`（16进制实体） |

**注意**：JS 数据中的 HTML 实体无法被 WXML 解析（WXML 通过 `{{}}` 设置的是 textContent 而非 innerHTML），必须在 JS 源码中直接使用 Unicode 字符。

**2. 刷题中心答题逻辑修复**

- `quiz/detail.js` 中 `onSelectOption()` 的正确答案判断写死为 `label === 'A'`
- 改为从 `question.correctAnswer` 字段读取，支持不同题目不同答案
- 同时将 `loadQuestion()` 中的题目也添加 `correctAnswer` 字段
- 移除初始数据中选项 A 的预选中状态（`selected: true, correct: true`）

**3. PAGES.md 文档完善**

- 新增「第二节 — 业务逻辑链路」：ASCII 全景架构图 + 核心数据流 + 跳转方式表
- 新增「待建页面清单」：识别 15 个有导航入口但缺失的目标页面，标注优先级（高/中/低）
- 补充「页面详情」：每个功能模块的交互细节、数据字段、已知问题
- 新增「文件清单速查」：完整目录树
- 修复原文档中"20个页面"与实际 21 页的矛盾
- 补充设计系统的 hex 编码说明、图标对照表

#### 影响范围
- `miniprogram/pages/training/index.js` — 4 个训练操法图标
- `miniprogram/pages/equipment/index.js` — 6 个分类 + 4 个器材图标
- `miniprogram/pages/equipment/detail.js` — 1 个器材图标
- `miniprogram/pages/shop/detail.js` — 1 个评价头像
- `miniprogram/pages/quiz/detail.js` — 答题逻辑
- `PAGES.md` — 文档重构
- `docs/log/everything.md` + `docs/log/feature-frontend-pages.md` — 日志更新

#### 改动原因
- HTML 实体在 JS 数据中无法被 WXML 正确渲染（微信小程序限制）
- 答题逻辑存在硬编码 Bug，无法支持多题切换
- PAGES.md 原文档缺少整体架构视角，不利于新开发者快速上手

#### 测试验证
- 训练操法页面图标正常显示（🔥 🔧 ⛰️）
- 器材装备分类侧边栏图标正常显示
- 器材详情页图标正常显示
- 商品详情评价头像正常显示（👨）
- 答题切换题目后正确选项判定正常
- 微信开发者工具预览无报错

#### 注意事项
- 确认所有 JS 文件中不再存在 `&#` 格式的 HTML 实体
- 后续新增页面数据时，请直接在 JS 中使用 Unicode Emoji 字符


## 0.0.3 - 2026-06-25

### 改动类型: 优化 + 修复

#### 改动内容

**1. 全局配色重构：红蓝 → 蓝白**

将整个小程序的配色方案从"消防红 + 救援蓝"改为统一的"专业蓝白"配色：

| 颜色角色 | 旧值 | 新值 |
|---------|------|------|
| 主色 Primary | `#E60012` | `#1a56db` |
| 主色深 Primary Dark | `#b7000c` | `#1e40af` |
| 次色 Secondary | `#005BAC` | `#0284c7` |
| 次色深 Secondary Dark | `#0b5eaf` | `#0369a1` |
| 红色背景 | `#FFEBEE` / `#fee2e2` / `#fef2f2` | `#eff6ff` / `#dbeafe` |
| 红色半透明 | `rgba(230,0,18,...)` | `rgba(26,86,219,...)` |
| 渐变色 | `#E60012→#ff3b30` 等 | `#1a56db→#3b82f6` 等 |

**影响范围**：
- `app.wxss` — 4 个 CSS 变量
- `app.json` — TabBar `selectedColor`
- 18 个 WXSS 文件 — 约 90 处颜色硬编码
- 6 个 WXML 文件 — 约 13 处内联样式
- 10 个 JS 文件 — 约 19 处 data 颜色值
- **合计：34 文件，约 120 处替换**

**2. 论坛帖子列表点击修复**

- `forum/index.wxml`：帖子卡片添加 `bindtap="onPostTap" data-id="{{item.id}}"`
- `forum/index.js`：新增 `onPostTap()` 方法 → 跳转至 `/pages/forum/detail`（页面待建，暂用 toast 提示）

#### 改动原因
- 用户要求统一改为蓝白配色风格
- 论坛帖子列表存在"断头路"——用户点击帖子无任何响应

#### 测试验证
- 全项目搜索旧颜色值（`#E60012`, `#ff3b30` 等 17 种模式）→ 零匹配
- 微信开发者工具预览各页面，主色显示为蓝色
- TabBar 选中态显示为蓝色
- 论坛帖子点击 → 弹出"帖子详情页开发中"提示

#### 注意事项
- 新配色以蓝色 (`#1a56db`) 为主色调，与原红色定位一致（强调元素、按钮、标题）
- 后续新增页面请使用新配色变量 `var(--color-primary)` 而非硬编码颜色值
- `forum/detail` 页面需要尽快新建，以完成论坛的完整浏览链路
