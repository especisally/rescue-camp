# PAGES.md — 应急救援战训营 小程序前端页面文档

> **最后更新**：2026-06-25  
> **版本**：0.2.0  
> **阅读对象**：AI 助手、新接手开发者  
> **目标**：一眼看懂这个项目有哪些页面、怎么跳转、设计规范是什么、还缺什么


## 一、项目概览

**应急救援战训营**（Rescue Camp）是一个面向消防救援人员的微信小程序培训平台，涵盖视频学习、战训工具、训练操法、器材管理、刷题考核、社区论坛、个人中心等模块。商城将直接接入微信小店。

- **技术栈**：微信小程序原生（WXML + WXSS + JavaScript）
- **设计基准**：iPhone 6/7/8，750rpx = 屏幕宽度
- **服务器**：`www.yjjyzxy.top`（宝塔面板）
- **开发工具**：VSCode（编码）+ Claude Code（AI 辅助）+ 微信开发者工具（调试）
- **当前状态**：前端框架完成（34页面），数据为静态 mock，未接入 API；商城待接入微信小店


## 二、业务逻辑链路（全貌）

```
                         ┌──────────────────────┐
                         │   微信小程序启动       │
                         │   app.js onLaunch     │
                         │   → 初始化云环境       │
                         │   → 获取系统信息       │
                         │   → globalData 赋值    │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │   TabBar 三大入口      │
                         └──────────┬───────────┘
                                    │
        ┌───────────────┬───────────┼───────────┬───────────────┐
        ▼               ▼           ▼           ▼               ▼
   ┌─────────┐   ┌─────────┐  ┌─────────┐
   │  首页    │   │  论坛    │  │  我的    │
   │ (index) │   │ (forum) │  │(profile)│
   └────┬────┘   └────┬────┘  └────┬────┘
        │              │            │
        │         ┌────▼────┐  ┌────▼────┐
        │         │ 发帖页   │  │菜单入口  │
        │         │ (post)  │  │(6项)    │
        │         └─────────┘  └─────────┘
        │
   ┌────▼──────────────────────────────┐
   │        首页 6 大功能模块            │
   │  ┌──────┐ ┌──────┐ ┌──────┐      │
   │  │视频学习│ │战训工具│ │训练操法│      │
   │  └──┬───┘ └──┬───┘ └──┬───┘      │
   │  ┌──────┐ ┌──────┐ ┌──────┐      │
   │  │器材装备│ │拓展学习│ │刷题中心│      │
   │  └──┬───┘ └──┬───┘ └──┬───┘      │
   └──────┼────────┼────────┼──────────┘
          │        │        │
    ┌─────▼──┐ ┌──▼───┐ ┌──▼────────┐
    │video/  │ │tools/│ │training/   │
    │index   │ │index │ │index       │
    │ play   │ │chemical│           │
    │category│ │standard│           │
    └────────┘ │+detail │           │
               └────────┘           │
          ┌─────▼─────┐  ┌──────────▼─────┐
          │equipment/ │  │learning/        │
          │index      │  │index            │
          │detail     │  │(video+doc list) │
          └───────────┘  └────────────────┘
          ┌─────▼─────┐
          │quiz/      │
          │index      │
          │detail     │
          │(答题+题卡) │
          └───────────┘

  （商城将直接接入微信小店，不在小程序内自建）
```

### 核心数据流

```
globalData (app.js)
  ├── statusBarHeight ──→ 所有页面自定义导航栏占位
  ├── isLoggedIn ───────→ profile/index 登录状态切换
  ├── userInfo ────────→ profile/index 用户信息展示
  └── env ─────────────→ 微信云开发环境 ID

页面数据 (每页 data 对象)
  ├── 全部为静态 mock 数据
  ├── 列表/详情数据写在 Page({data:{...}})
  └── 用户交互反馈用 wx.showToast 模拟
```

### 页面间跳转方式

| 跳转类型 | 使用场景 | 示例 |
|----------|---------|------|
| `<navigator>` 组件 | WXML 声明式跳转 | 首页功能网格 → 各子页 |
| `wx.navigateTo` | JS 编程式跳转（保留历史） | 购物车 → 结算页 |
| `wx.switchTab` | JS 切换 TabBar | 子页返回首页（fallback） |
| `wx.navigateBack` | 返回上一页 | 所有子页的 goBack() |
| `wx.redirectTo` | 替换当前页（不保留历史） | video/play 返回 video/index |


## 三、页面清单（36 个已注册）

### 3.1 全部页面（app.json 中声明）

| # | 页面路径 | 类型 | 页面名称 | 入口方式 | 状态 |
|---|---------|------|---------|---------|------|
| 1 | `pages/index/index` | Tab | 首页 | TabBar | ✅ |
| 2 | `pages/forum/index` | Tab | 论坛主页 | TabBar | ✅ |
| 3 | `pages/forum/post` | 普通 | 论坛发帖 | 论坛 FAB 按钮 | ✅ |
| 4 | `pages/forum/detail` | 普通 | 帖子详情 + 评论区 | 论坛帖子列表项 | ✅ |
| 5 | `pages/profile/index` | Tab | 个人中心 | TabBar | ✅ |
| 6 | `pages/video/index` | 普通 | 视频学习列表 | 首页功能网格 | ✅ |
| 6b | `pages/video/category` | 普通 | 视频分类详情 | 视频分类卡片 | ✅ |
| 7 | `pages/video/play` | 普通 | 视频播放页 | 视频卡片 / 推荐列表 | ✅ |
| 8 | `pages/tools/index` | 普通 | 战训工具主页 | 首页功能网格 | ✅ |
| 9 | `pages/tools/chemical` | 普通 | 危化品查询 | 战训工具 → Hero 卡片 | ✅ |
| 10 | `pages/tools/chemical-detail` | 普通 | 危化品详情 | 危化品列表项 | ✅ |
| 11 | `pages/tools/standard` | 普通 | 考核标准查询 | 战训工具 → Hero 卡片 | ✅ |
| 12 | `pages/tools/standard-detail` | 普通 | 考核标准详情 | 考核标准列表项 | ✅ |
| 13 | `pages/training/index` | 普通 | 训练操法列表 | 首页功能网格 | ✅ |
| 14 | `pages/training/detail` | 普通 | 训练操法详情 | 训练操法列表项 | ✅ |
| 15 | `pages/equipment/index` | 普通 | 器材装备列表 | 首页功能网格 | ✅ |
| 16 | `pages/equipment/detail` | 普通 | 器材详情 | 器材列表项 | ✅ |
| 17 | `pages/learning/index` | 普通 | 拓展学习 | 首页功能网格 | ✅ |
| 18 | `pages/learning/detail` | 普通 | 拓展学习详情 | 视频/资料列表项 | ✅ |
| 19 | `pages/quiz/index` | 普通 | 刷题中心 | 首页功能网格 | ✅ |
| 20 | `pages/quiz/detail` | 普通 | 题库答题 | 题库列表项 | ✅ |
| 21 | `pages/quiz/result` | 普通 | 答题结果/错题本 | 答题完成"交卷" | ✅ |
| 22 | `pages/search/index` | 普通 | 全局搜索结果 | 所有页面搜索栏 | ✅ |
| 23 | `pages/notification/index` | 普通 | 消息通知 | 论坛导航铃铛图标 | ✅ |
| 24 | `pages/settings/index` | 普通 | 设置页面 | 个人中心齿轮图标 | ✅ |
| 25 | `pages/about/index` | 普通 | 关于战训资源 | 个人中心菜单 | ✅ |
| 26 | `pages/help/index` | 普通 | 帮助反馈 | 个人中心菜单 | ✅ |
| 27 | `pages/certification/index` | 普通 | 职业技能鉴定 | 个人中心菜单 | ✅ |
| 28 | `pages/favorites/index` | 普通 | 我的收藏 | 个人中心菜单 | ✅ |
| 29 | `pages/comments/index` | 普通 | 我的评论 | 个人中心菜单 | ✅ |
| 30 | `pages/uploads/index` | 普通 | 我的上传 | 个人中心菜单 | ✅ |
| 31 | `pages/login/index` | 普通 | 登录/授权 | 个人中心"点击登录" | ✅ |
| 32 | `pages/profile/edit` | 普通 | 编辑资料 | 个人中心用户卡片 | ✅ |


## 四、页面导航流程（完整版）

```
首页 (index)
├── 搜索栏 ──→ [search/index]
├── 筛选按钮 ☰
├── Banner 轮播（3 张，渐变色背景，自动切换）
├── 功能网格 3×2
│   ├── [视频学习] ──→ video/index ──→ video/category ──→ video/play
│   ├── [战训工具] ──→ tools/index ──→ tools/chemical ──→ tools/chemical-detail
│   │                              └──→ tools/standard ──→ tools/standard-detail
│   ├── [训练操法] ──→ training/index ──→ training/detail
│   ├── [器材装备] ──→ equipment/index ──→ equipment/detail
│   ├── [拓展学习] ──→ learning/index ──→ learning/detail
│   └── [刷题中心] ──→ quiz/index ──→ quiz/detail ──→ quiz/result
└── "为您推荐" → 查看全部 → video/index

论坛 (forum/index)
├── 搜索栏 ──→ search/index
├── 通知铃铛 ──→ notification/index
├── 签到按钮（状态切换 +5 积分）
├── 筛选标签（最新/热门/精华/资源）
├── 帖子列表 ──→ forum/detail
└── [发帖 FAB] ──→ forum/post

我的 (profile/index)
├── 搜索图标 ──→ search/index
├── 设置图标 ──→ settings/index
├── 用户卡片（未登录→登录切换）
│   ├── 点击登录 ──→ login/index
│   └── 点击编辑 ──→ profile/edit
├── 菜单组 1：我的操作
│   ├── 我的收藏 ──→ favorites/index
│   ├── 我的评论 ──→ comments/index
│   └── 我的上传 ──→ uploads/index
├── 菜单组 2：职业技能鉴定
│   └── certification/index
├── 菜单组 3：其他
│   ├── 帮助反馈 ──→ help/index
│   └── 关于战训资源 ──→ about/index
├── 退出登录按钮
└── 版本号展示
```


## 五、页面详情

### 5.1 首页 `pages/index/index`

**功能**：平台主入口，聚合所有模块入口和推荐内容。

**结构**：
- 自定义导航栏（标题 "应急救援战训营" + 搜索栏 🔍 + 筛选按钮 ☰）
- Banner 轮播（3 张，`linear-gradient` 渐变色背景，`autoplay` 4s 自动切换，`circular` 循环）
- 功能网格 3×2（6 个模块卡片，每卡 = Emoji 图标 + 标题 + 副标题 + 彩色背景）
- "为您推荐" 区块（大图卡片 `HOT` + 横向列表卡片 ×2，带标签/观看量/互动数）

**数据来源**：`index.js` 中的静态数据：
- `data.banners` — 轮播图（id, title, subtitle, icon, bg）
- `data.menus` — 功能网格（id, name, desc, icon, colorBg, url）
- `data.recommends` — 推荐列表（id, title, tag, icon, bg, views/interactions）

**关键交互**：
- 搜索栏：仅 UI，未绑定事件（→ 待接入 search 页）
- 筛选按钮 ☰：仅 UI
- 功能网格：`<navigator url="{{item.url}}">` 声明式跳转
- 推荐 "查看全部" → `/pages/video/index`

---

### 5.2 论坛 `pages/forum/index` + `pages/forum/post`

**列表页结构**：
- 搜索导航栏（搜索 placeholder + 通知铃铛 🔔 + 头像 👤）
- 论坛头部（Logo 🌊 + 标题 "战训论坛" + 签到按钮）
- 积分横幅（红色渐变 `#E60012 → #ff3b30` + ⭐ "分享视频赚积分"）
- 筛选标签（最新/热门/精华/资源 — 下划线指示器）
- 帖子列表（4 种卡片类型）：
  - **视频帖**：暗色缩略图 + ▶ 播放按钮 + 时长角标 + 积分标记
  - **图文帖**：标题 + 摘要（`line-clamp-2`）+ 无媒体
  - **多图帖**：3 图网格 + "+N" 覆盖层
- 发帖 FAB 按钮（右下角悬浮 ✎，`position: fixed`）

**发帖页结构**：
- 类型切换（视频/资料/课件）
- 上传区域（`wx.showActionSheet` 选择相册/聊天记录）
- 标题 input + 正文 textarea
- 积分设置（0/2/5/8/自定义，单选切换）
- 分类标签（预设标签 + 自定义标签，最多 5 个）
- 协议确认 checkbox + 安全提示卡片
- 底部提交按钮（校验标题/内容/协议 → 模拟发布 → 返回）

**⚠️ 已知问题**：
- **帖子列表项没有绑定跳转事件** — 点击帖子不会进入详情页，需要增加 `bindtap` 跳转到 `forum/detail`
- 通知铃铛 🔔 无跳转

---

### 5.3 个人中心 `pages/profile/index`

**功能**：用户信息展示和功能入口集合。

**两种 UI 状态**：
- **未登录**：灰色头像 👤 + "点击授权登录" + "登录后同步学习进度" → `toggleLogin()`
- **已登录**：红蓝渐变头像 👨‍🚒 + 姓名(张建国) + 等级徽章(高级指挥员) + ID + 积分(⭐ 1,280) → `onEditProfile()`

**菜单结构**（3 组卡片）：
| 组 | 菜单项 | 图标 | URL | 当前行为 |
|----|--------|------|-----|---------|
| 操作 | 我的收藏 | ⭐ | `''` | toast "功能开发中" |
| 操作 | 我的评论 | 💬 | `''` | toast "功能开发中" |
| 操作 | 我的上传 | 📤 | `''` | toast "功能开发中" |
| 鉴定 | 职业技能鉴定 | ✅ | `''` | toast "功能开发中" |
| 其他 | 帮助反馈 | ❓ | `''` | toast "功能开发中" |
| 其他 | 关于战训资源 | ℹ️ | `''` | toast "功能开发中" |

**底部**：退出登录按钮（红色文字）+ 版本号 "应急救援战训营 v0.0.1"

---

### 5.4 功能区子页（6 个模块，共 13 个页面）

#### 5.4.1 视频学习 `pages/video/*`（3 页）

| 页面 | 结构 | 关键交互 |
|------|------|---------|
| `video/index` | 顶部导航 + 搜索栏 + 8 类灾害单列满行色彩卡片（图标+名称+箭头+双色渐变） | 点击分类 → `video/category?id=X&name=X` |
| `video/category` | 搜索栏 + 5 筛选标签（全部/最新/最多播放/免费/积分）+ 视频列表卡片（缩略图+时长角标+积分角标+标题+作者+播放量+标签）+ 空状态 | 搜索+筛选联动过滤、点击视频 → `video/play` |
| `video/play` | 视频占位区 + 标题/作者/播放量/时长 + 简介展开/收起 + 相关推荐列表 | 简介 `toggleDesc()`、相关视频跳转 |

**⚠️ 问题**：视频播放区为占位 `<view>`，未使用 `<video>` 组件

---

#### 5.4.2 战训工具 `pages/tools/*`（5 页）

| 页面 | 结构 | 特点 |
|------|------|------|
| `tools/index` | 4 张 Hero 大图卡片（危化品查询 🧪/考核标准查询 ✅/安全计算 ⚡/救援案例 📋）+ 快捷工具条 | 后两张标记"即将上线" |
| `tools/chemical` | 搜索栏 + 8 分类标签（横向滚动 全部/爆炸品/气体/易燃液体/固体/氧化剂/毒害品/腐蚀品） + 危化品列表（UN编号+名称+分子式+危险类别色标） | `filterList()` 按分类+关键词联动过滤 |
| `tools/chemical-detail` | 危化品完整信息卡片（编号/名称/分子式/危险类别/理化性质/消防措施/急救措施/包装与储存） | 静态数据展示 |
| `tools/standard` | 搜索栏 + 4 分类标签（全部/体能考核/技能考核/理论考核/综合考核） + 标准列表（标题+标签+描述） | `filterList()` 过滤 |
| `tools/standard-detail` | 考核标准完整信息（适用对象/考核项目/合格标准/评分细则） | 静态数据展示 |

---

#### 5.4.3 训练操法 `pages/training/*`（2 页）

**结构**：
- 搜索栏 + 分类标签（全部操法/灭火操法/救人操法/体能竞技/装备应用）
- 进度圆环（`border` 模拟，4/12 已完成，33%）
- 精选大图推荐（"高层建筑灭火操法"）
- 2 列操法网格（图标 + 名称 + 分类标签 + 状态指示）

**⚠️ 问题**：训练操法卡片没有详情页跳转（→ 待建 `training/detail`）

---

#### 5.4.4 器材装备 `pages/equipment/*`（2 页）

| 页面 | 结构 | 特点 |
|------|------|------|
| `equipment/index` | 搜索栏 + 左侧分类边栏（6类: 基础/特种/破拆/药剂/急救/侦检，`max-width:160rpx`）+ 右侧列表（名称/型号/描述/状态色标/标签）+ FAB 添加按钮 | `filterList()` 分类+关键词联动，列表/网格双视图切换 |
| `equipment/detail` | 器材完整信息（图/型号/编号/状态）+ 规格参数表 + 使用说明 + 适用场景 + 操作规程 + 维护保养 + 底部报修/领用按钮 | `id` 参数驱动，`getEquipmentData(id)` 查表 |

---

#### 5.4.5 拓展学习 `pages/learning/*`（2 页）

**结构**：
- 筛选标签（全部/内涝救援/高层火灾/山岳绳索/工业灾害/地震搜救）
- 视频卡片流（国际救援案例，渐变背景缩略图 + 标题/国别/时长/日期/观看量）
- 资料库卡片（PDF/DOCX 文档，格式图标 + 标题/来源/文件大小）

**⚠️ 问题**：视频卡片和资料卡片都没有详情页跳转（→ 待建 `learning/detail`）

---

#### 5.4.6 刷题中心 `pages/quiz/*`（3 页）

| 页面 | 结构 | 关键交互 |
|------|------|---------|
| `quiz/index` | 搜索栏 + 7 分类标签（全部/作战训练安全/灭火救援/晋级考核/职业技能鉴定/水域救援/绳索救援）+ 题库列表（图标/标题/题量/日期/按钮） | `onTabSwitch()` 切换分类、`onBankTap()` → `quiz/detail?id=X` |
| `quiz/detail` | 顶部进度条 + 题型标签 + 题目文本 + 4 选项（A/B/C/D，正确=绿色/错误=红色）+ 解析区 + 收藏/上一题/下一题 + 答题卡弹窗 | `onSelectOption()` 判断正确/错误并变色、答题卡 10×10 网格 |

**答题逻辑**：
1. 点击选项 → 对比 `label === 'A'`（当前写死 A 为正确答案）
2. 正确选项变绿、错误选项变红、`showResult: true`
3. 解析区显示解释文字
4. 答题卡用 `sheetList` 数组（`done: true/false`），灰色=未做，绿色=已做

**⚠️ 问题**：
- 正确答案写死为 `'A'`，换题时不变
- 缺少答题完成/得分统计页面（→ 待建 `quiz/result`）


## 六、设计系统

### 6.1 色彩令牌

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--color-primary` | `#1a56db` | 专业蓝 — 主按钮、强调元素、标题 |
| `--color-primary-dark` | `#1e40af` | 深蓝 — 按钮按下态 |
| `--color-secondary` | `#0284c7` | 天蓝 — 次按钮、链接、标签 |
| `--color-secondary-dark` | `#0369a1` | 深天蓝 — 按钮按下态 |
| `--color-tertiary` | `#5a5a5a` | 灰色 — 辅助文字 |
| `--color-background` | `#f9f9f9` | 页面背景 |
| `--color-surface` | `#ffffff` | 卡片/容器背景 |
| `--color-surface-variant` | `#e2e2e2` | 边框/分隔线 |
| `--color-on-surface` | `#1a1c1c` | 主要文字 |
| `--color-on-surface-variant` | `#5f3f3b` | 次要文字 |
| `--color-error` | `#ba1a1a` | 错误/危险 |
| `--color-outline` | `#946e69` | 轮廓线 |
| `--color-outline-variant` | `#e9bcb6` | 轮廓线变体 |

### 6.2 间距系统（rpx）

| 变量 | 值 | 用途 |
|------|-----|------|
| `--spacing-gutter` | `24rpx` | 栅格间距 |
| `--spacing-stack-sm` | `8rpx` | 紧凑间距 |
| `--spacing-stack-md` | `16rpx` | 标准间距 |
| `--spacing-section` | `24rpx` | 区块间距 |
| `--spacing-container` | `24rpx` | 页面左右边距 |

### 6.3 字体层级

| 类名 | 字号 | 行高 | 粗细 | 用途 |
|------|------|------|------|------|
| `text-xs` | `20rpx` | — | — | 标签、角标 |
| `text-sm` | `24rpx` | — | — | 辅助文字 |
| `text-md` | `28rpx` | `1.5` | `400` | 正文（默认） |
| `text-lg` | `32rpx` | — | — | 小标题 |
| `text-xl` | `40rpx` | — | — | 页面标题 |
| `text-2xl` | `48rpx` | — | — | 大数字 |

### 6.4 全局工具类（app.wxss）

所有页面可使用以下类名，无需重复编写：

- **布局**：`.flex`, `.flex-col`, `.flex-row`, `.flex-1`, `.flex-wrap`, `.items-center`, `.items-start`, `.justify-center`, `.justify-between`, `.justify-around`, `.justify-end`
- **间距**：`.mt-4/8/12/16/24`, `.mb-4/8/12/16`, `.ml-4/8`, `.mr-4/8`, `.p-8/12/16`, `.px-8/12/16`, `.py-4/8/12`, `.gap-4/8/12/16`
- **卡片**：`.card`（白底圆角边框）, `.card-padded`（同上 + 24rpx 内边距）
- **按钮**：`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost`, `.btn-sm/lg/full/round`
- **标签**：`.tag`, `.tag-primary`, `.tag-secondary`, `.tag-outline`
- **文字**：`.text-xs/sm/md/lg/xl/2xl`, `.text-primary/secondary/tertiary/on-surface/on-surface-variant/white/error`
- **字重**：`.font-bold`, `.font-semibold`, `.font-medium`
- **对齐**：`.text-center`, `.text-right`
- **截断**：`.truncate`, `.line-clamp-2`
- **网格**：`.grid-2`（2列）, `.grid-3`（3列）
- **搜索栏**：`.search-bar`
- **其他**：`.divider`, `.avatar(.sm/.lg)`, `.container`, `.page-body`, `.safe-bottom`, `.hide-scrollbar`, `.sticky-top`, `.overlay`, `.status-bar`

### 6.5 图标方案

项目使用 **Unicode Emoji 字符**直接作为图标（不依赖外部图标库）：

| 图标 | 字符 | 使用场景 |
|------|------|---------|
| 🔍 | 搜索 | 搜索栏 |
| ☰ | 菜单 | 筛选/更多 |
| ← | 返回 | 导航栏返回 |
| ⭐ | 收藏/积分 | 收藏按钮/积分显示 |
| 👤 | 用户 | 头像占位 |
| ▶ | 播放 | 视频播放按钮 |
| 🔔 | 通知 | 通知图标 |
| 🛒 | 购物车 | 商城入口 |
| 📦 | 器材 | 装备列表 |
| 💬 | 评论 | 帖子互动 |
| 📖 | 资料 | 文档图标 |
| 👁 | 查看 | 播放量/阅读量 |
| ✎ | 编辑 | 发帖 FAB |
| ⚙ | 设置 | 个人中心设置 |
| ❓ | 帮助 | 帮助反馈 |
| ℹ️ | 关于 | 关于页面 |
| ✅ | 认证 | 职业技能鉴定 |
| 🌐 | 网络 | 拓展学习 |
| 📝 | 刷题 | 刷题中心 |
| 🔧 | 工具 | 战训工具 |
| 💪 | 训练 | 训练操法 |
| 🚒 | 消防车 | Banner |
| 🌊 | 水域 | 水域救援 |
| 🔥 | 火灾 | 灭火相关 |
| ⛰️ | 山岳 | 山岳救援 |
| ⛑️ | 救援头盔 | 商品图标 |
| 🧪 | 化学 | 危化品 |
| 🧥 | 战斗服 | 商品图标 |
| 📻 | 对讲机 | 商品图标 |
| 📡 | 通讯 | 分类图标 |
| 🔩 | 破拆 | 分类图标 |
| 🏥 | 急救 | 分类图标 |

---

## 七、每个页面文件结构

```
pages/<模块名>/
├── index.wxml    # 页面结构（相当于 HTML）
├── index.wxss    # 页面样式（相当于 CSS）
├── index.js      # 页面逻辑（数据 + 事件）
└── index.json    # 页面配置 { "navigationStyle": "custom" }
```

**关键约定**：
- 所有页面使用 `"navigationStyle": "custom"`（自定义导航栏），系统导航栏隐藏
- 导航栏高度：`88rpx`（44px）+ `statusBarHeight`（系统状态栏）
- 页面底部留白：`120rpx`（为系统 TabBar 让位，`.page-body { padding-bottom: 120rpx }`）
- 状态栏高度获取方式：
  - 优先：`getApp().globalData.statusBarHeight`（app.js onLaunch 时通过 `wx.getSystemInfoSync()` 获取）
  - 备用：各页面 `onLoad` 中重新调用 `wx.getSystemInfoSync()`


## 八、app.json 关键配置

```json
{
  "pages": [ /* 32 个页面路由，首个为首页 */ ],
  "window": {
    "navigationStyle": "custom",     // 所有页面使用自定义导航
    "backgroundColor": "#f9f9f9",
    "navigationBarTitleText": "应急救援战训营"
  },
  "tabBar": {
    "color": "#5a5a5a",
    "selectedColor": "#1a56db",
    "list": [
      { "pagePath": "pages/index/index",   "text": "首页", "iconPath": "images/icons/home.png",        "selectedIconPath": "images/icons/home-active.png" },
      { "pagePath": "pages/forum/index",   "text": "论坛", "iconPath": "images/icons/examples.png",    "selectedIconPath": "images/icons/examples-active.png" },
      { "pagePath": "pages/profile/index", "text": "我的", "iconPath": "images/icons/usercenter.png",  "selectedIconPath": "images/icons/usercenter-active.png" }
    ]
  }
}
```


## 九、当前状态与待办

### ✅ 已完成（v0.0.6）
- [x] 全部 33 个页面（3 Tab + 30 子页），约 132 个页面文件 + 4 custom-tab-bar 文件
- [x] 全局样式系统（app.wxss：60+ 工具类、12 色彩令牌、间距/字体/圆角变量）
- [x] 所有页面间导航链接（`<navigator>` 组件 + `wx.navigateTo`/`wx.switchTab`）
- [x] HTML 实体修复（Material Icons 和 `&#XXXX;` → Unicode Emoji，共 89 处）
- [x] 布局适配修复（全局 `box-sizing: border-box` + 各页面 `width: 100%`）
- [x] 自定义 TabBar 组件（3Tab：首页/论坛/我的）
- [x] 项目文档（PAGES.md + REQUIREMENTS.md + 改动日志）
- [x] 全局搜索功能（3Tab 分类搜索：课程/帖子/装备 + 搜索历史）
- [x] 答题交卷 → 结果页完整流程
- [x] 论坛帖子详情页完整实现（内容+评论区+子回复+输入弹层+相关推荐）
- [x] 视频分类单列满行布局 + 分类详情页
- [x] 战训工具 2 列网格布局
- [x] 完整后端+前端需求文档（55 API + 19 数据表）
- [x] 商城模块删除（后续接入微信小店）
- [x] 3 个超大图片资源清理（原超 200KB）

### 🔲 技术债务（后续迭代）

**🔵 技术债务**
- [ ] 接入真实 API（当前全部为静态 mock 数据）
- [ ] 视频播放器集成（替换占位 `<view>` 为 `<video>` 组件）
- [ ] 用户登录/微信授权（替换模拟登录流程）
- [ ] 论坛发帖上传功能（`wx.chooseMedia` + 云存储）
- [ ] 商城下单与支付流程（微信支付接入）
- [ ] 刷题计分与错题本持久化
- [ ] 图片资源替换为实际素材（当前大量使用 Emoji + 渐变色替代）
- [ ] 真机测试验证


## 十、待建页面设计参考

以下是建议的页面结构和关键数据字段，供后续开发参考：

### 10.1 论坛帖子详情 `pages/forum/detail`
```
结构：帖子完整内容 + 评论区列表 + 底部评论输入框
数据：{ post: {title, content, images[], author, time, likes, comments[] }, relatedPosts[] }
入口：forum/index 帖子卡片 bindtap → navigateTo
```

### 10.2 搜索结果 `pages/search/index`
```
结构：搜索栏(autofocus) + 分类Tab(课程/帖子/商品/装备) + 结果列表
数据：{ keyword, activeTab, results[], history[] }
入口：全局搜索栏 bindtap → navigateTo
```

### 10.3 训练操法详情 `pages/training/detail`
```
结构：操法名称 + 标签 + 流程步骤图 + 装备清单 + 安全注意 + 教学视频
数据：{ drill: { name, steps[], equipments[], videoUrl, cautions[] } }
入口：training/index 操法卡片 bindtap → navigateTo
```

### 10.4 登录/授权 `pages/login/index`
```
结构：Logo + 标题 + 微信一键登录按钮 + 隐私协议
数据：无（调用 wx.login + wx.getUserProfile）
入口：profile/index "点击授权登录" bindtap → navigateTo（替换 toggleLogin）
```


## 十一、文件清单速查

```
miniprogram/
├── app.js                          # 全局逻辑（云初始化、globalData）
├── app.json                        # 页面路由 + TabBar + Window 配置
├── app.wxss                        # 全局样式系统（60+ 工具类）
├── sitemap.json
├── config/
│   └── index.js                    # API 配置（baseUrl, timeout）
├── utils/
│   ├── request.js                  # 网络请求封装
│   └── util.js                     # 通用工具函数
├── components/
│   └── cloudTipModal/              # 云开发提示弹窗组件
├── images/
│   ├── icons/                      # TabBar 图标（home/examples/usercenter + active）
│   └── *.png/svg                   # 占位图和资源文件
└── pages/
    ├── index/                      # 首页（Tab 1）
    ├── forum/                      # 论坛（Tab 2）+ post 子页
    ├── profile/                    # 我的（Tab 3）
    ├── video/                      # 视频学习 + play
    ├── tools/                      # 战训工具 + chemical/standard + 各 detail
    ├── training/                   # 训练操法
    ├── equipment/                  # 器材装备 + detail
    ├── learning/                   # 拓展学习
    └── quiz/                       # 刷题中心 + detail

项目根目录/
├── PAGES.md                        # ← 本文件
├── CLAUDE.md                       # AI 助手行为准则
├── docs/log/
│   ├── everything.md               # 改动汇总日志
│   └── feature-frontend-pages.md   # 前端框架详细日志
└── project.config.json             # 微信开发者工具项目配置
```
