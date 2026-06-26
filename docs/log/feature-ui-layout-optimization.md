# 前端UI布局优化 + 新页面 + 需求文档 改动记录

## 0.0.5 - 2026-06-25

### 改动类型: 新增 + 优化

---

#### 改动内容

**1. 视频分类单列满行（video/index）**
- `video/index.wxss`：`.category-grid` 从 flex-wrap 改为 `flex-direction: column`，`.category-card` 从 `width: calc(50% - 12rpx)` 改为 `width: 100%`，高度从 `200rpx` 调整为 `160rpx`
- `video/index.wxml`：卡片内新增图标（`.card-icon`）和箭头（`.card-arrow`），使用 `linear-gradient` 双色渐变背景
- `video/index.js`：categories 数据新增 icon、bgColor2 字段，onCategoryTap 改为 navigateTo 新页面

**2. 新建视频分类详情页（video/category）**
- 新增 4 个文件：`category.wxml` / `category.wxss` / `category.js` / `category.json`
- 功能：搜索栏（支持标题/作者/标签搜索）+ 5 个筛选标签 + 视频列表卡片 + 空状态
- 8 个分类共 27 条模拟视频数据，每条含缩略图背景、时长、积分、标签
- 筛选：全部/最新发布/最多播放/免费课程/积分课程
- `app.json` 注册新页面路由

**3. 战训工具页 2 列布局（tools/index）**
- `tools/index.wxml`：4 张 Hero 卡片用 `.hero-grid` 包裹，危化品图标从 ⚖ 改为 🧪
- `tools/index.wxss`：新增 `.hero-grid`（flex-wrap + gap: 20rpx），`.hero-card` 从 `width: 100%` 改为 `width: calc(50% - 10rpx)`，高度从 `400rpx` 调整为 `300rpx`，缩小图标/标题/副标题字号

**4. 危化品详情 & 训练操法 — 已为 2 列（无需改动）**
- 危化品详情 `.prop-item` 已有 `width: calc(50% - 8rpx)`
- 训练操法 `.train-card` 已有 `width: calc(50% - 10rpx)`

**5. 论坛帖子详情页完整实现（forum/detail）**
- 完全重写 4 个文件（原为空占位页）
- WXML：导航栏 + 作者卡片 + 帖子标题/标签/正文 + 图片网格 + 视频缩略图 + 互动数据条 + 点赞/收藏/分享按钮 + 评论区（含子回复）+ 相关推荐 + 底部评论输入栏 + 评论输入弹层
- WXSS：200+ 行完整样式，含导航栏、卡片、评论区、子回复、弹层等所有组件样式
- JS：支持 4 篇帖子模拟数据 + 5 条评论（含子回复）+ 3 篇相关推荐，完整交互逻辑（点赞/收藏/关注/评论排序/发表评论/回复特定用户）

**6. 编写完整需求文档（docs/REQUIREMENTS.md）**
- 项目概述、用户角色、前端需求 11 个模块详解
- 后端 8 大模块 55 个 RESTful API 接口
- 19 张数据库表设计（含字段和设计原则）
- 非功能性需求（性能/安全/数据/运维）
- 4 阶段开发路线图

---

#### 影响范围
- 视频学习模块（video/index, video/category, video/play）
- 战训工具模块（tools/index）
- 论坛模块（forum/detail）
- app.json 页面注册
- 项目文档（REQUIREMENTS.md, everything.md）

---

#### 相关文件
- `miniprogram/pages/video/index.wxml` — 新增图标+箭头+渐变背景
- `miniprogram/pages/video/index.wxss` — 单列布局样式
- `miniprogram/pages/video/index.js` — 数据增强+跳转逻辑
- `miniprogram/pages/video/category.wxml` — **新建** 分类详情页结构
- `miniprogram/pages/video/category.wxss` — **新建** 分类详情页样式
- `miniprogram/pages/video/category.js` — **新建** 27条视频数据+筛选逻辑
- `miniprogram/pages/video/category.json` — **新建** 页面配置
- `miniprogram/pages/tools/index.wxml` — Hero网格化
- `miniprogram/pages/tools/index.wxss` — 2列布局样式
- `miniprogram/pages/forum/detail.wxml` — **重写** 完整帖子详情
- `miniprogram/pages/forum/detail.wxss` — **重写** 200+行样式
- `miniprogram/pages/forum/detail.js` — **重写** 完整交互逻辑
- `miniprogram/pages/forum/detail.json` — 补充 navigationStyle
- `miniprogram/app.json` — 注册 video/category 页面
- `project.config.json` — 版本 0.0.4 → 0.0.5
- `CLAUDE.md` — 版本号更新
- `docs/REQUIREMENTS.md` — **新建** 完整需求文档
- `docs/log/everything.md` — 0.0.5 条目

---

#### 改动原因
1. 视频分类原 2 列布局留空大、视觉冲击力弱 → 改为单列满行
2. 点击分类后只有 toast 提示，无法查看视频 → 新建分类详情页
3. 战训工具 Hero 卡片各占一行浪费空间 → 改为 2 列紧凑布局
4. 论坛帖子列表有点击跳转但详情页为空 → 完整实现
5. 项目需要后端对接 → 编写完整需求文档指导后续开发

---

#### 注意事项
- 所有新增数据均为静态 mock，待接入真实 API 后替换
- 视频播放页仍使用 `<view>` 占位，需接入 `<video>` 组件
- 论坛页帖子列表 `onPostTap` 在 v0.0.3 已新增，本版本完善了目标页面

---

## 0.0.6 - 2026-06-25

### 改动类型: 删除 + 优化

#### 改动内容
- 删除全部商城页面代码（16个文件，4页×4），后续商城功能由微信小店替代
- app.json 移除 4 个商城页面路由 + TabBar 商城项（4Tab → 3Tab）
- custom-tab-bar 组件移除商城 Tab，同步为 3Tab
- 全局搜索页移除"商品"Tab 及相关 6 条商品数据
- 删除 3 个超大图片资源（ai_example1.png / create_cbr.png / create_cbrf.png）
- PAGES.md 全面更新

#### 相关文件
- `miniprogram/pages/shop/` 整个目录删除（4页×4文件 = 16文件）
- `miniprogram/app.json` — 移除商城路由和 TabBar
- `miniprogram/custom-tab-bar/` — 4Tab → 3Tab
- `miniprogram/pages/search/index.js` — 移除商品 Tab
- `miniprogram/images/` — 清理超大图片

---

## 0.0.7 - 2026-06-25

### 改动类型: 新增 + 修复

#### 改动内容
- 恢复商城 TabBar 按钮（4Tab：首页/论坛/商城/我的），创建商城占位页 `pages/shop/index`
- 修复视频分类详情页搜索框被固定导航栏遮挡（`.search-wrap` margin-top 加入 statusBarHeight）
- 确认战训工具 Hero 卡片已是 2 列布局、训练操法卡片已是 2 列布局
- 论坛页布局重组：签到按钮移至标题右侧、搜索栏移至论坛头部下方独立一行

#### 相关文件
- `miniprogram/pages/video/category.wxml` — 搜索栏加入 statusBarHeight 偏移
- `miniprogram/pages/forum/index.wxml` — 论坛头部布局重组
- `miniprogram/pages/shop/index.*` — 新建商城占位页

---

## 0.0.8 - 2026-06-25

### 改动类型: Bug修复 + 布局优化

#### 改动内容
1. **4 处导航栏遮挡修复**（position: fixed 导航栏未计入 statusBarHeight）：
   - `video/index` — search-wrap margin-top 加入 `calc(88rpx + {{statusBarHeight}}px)`
   - `video/play` — video-container margin-top 同上
   - `quiz/index` — hero-section margin-top 同上
   - `quiz/detail` — progress-wrap margin-top 同上
   
2. **2 列布局重写**（微信 WXSS 对 `flex` 简写 + `calc()` + `gap` 支持有兼容性问题，导致 1 列显示）：
   - `tools/index` — 移除 `gap: 20rpx` + `flex: 0 0 calc(50% - 10rpx)`，改用 `width: 48.5%` + `justify-content: space-between` + `margin-bottom: 20rpx`
   - `training/index` — 同上
   - `tools/index` — `.quick-tools` 也同步修复（`gap` + `flex: 1` → `width: 48.5%` + `space-between`）
   
3. **论坛头部布局修正**：
   - 移除 `justify-between`，签到按钮+铃铛紧挨标题文字右侧，不再远端分离

4. **版本号显示修复**：
   - `profile/index.wxml` 版本号 v0.0.4 → v0.0.8（之前漏更新）

#### 影响范围
- 视频学习模块（video/index, video/play）
- 刷题中心模块（quiz/index, quiz/detail）
- 战训工具模块（tools/index）
- 训练操法模块（training/index）
- 论坛模块（forum/index）
- 个人中心（profile/index）

#### 相关文件
- `miniprogram/pages/video/index.wxml` — search-wrap 加 statusBarHeight
- `miniprogram/pages/video/play.wxml` — video-container 加 statusBarHeight
- `miniprogram/pages/quiz/index.wxml` — hero-section 加 statusBarHeight
- `miniprogram/pages/quiz/detail.wxml` — progress-wrap 加 statusBarHeight
- `miniprogram/pages/tools/index.wxss` — hero-card 改 flex 属性
- `miniprogram/pages/training/index.wxss` — train-card 改 flex 属性
- `miniprogram/pages/forum/index.wxml` — 论坛头部布局修正
- `miniprogram/pages/profile/index.wxml` — 版本号修正
- `project.config.json` — 版本 0.0.7 → 0.0.8
- `CLAUDE.md` — 版本号更新
- `docs/log/everything.md` — 0.0.8 条目

#### 其他发现（本次未修复，需后续跟进）
- `pages/search/index.*` — 全局搜索页为空白占位（WXML仅1行 `<text>`，JS为模板骨架）
- `pages/quiz/result.*` — 答题结果页为空白占位（同上）
