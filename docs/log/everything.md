# 改动日志汇总

> 本文档记录项目所有改动的简述，每次改动新增一条。  
> 详细日志见各模块对应的 `.md` 文件。

---

## 0.2.1 - 2026-06-26 - Bug修复 + 种子数据扩充 + 前端 API 基础设施

- 修复敏感词过滤 Bug：`sensitiveFilter.js` 中 `REPEAT_CHAR` 未定义 → `REPLACE_CHAR` ✅
- 种子数据大幅扩充：训练操法 4 条 + 装备 6 件 + 题库 3 个（21 题）+ 帖子 5 篇 + 评论 6 条 + 推荐 5 条 + 危化品 4 条 + 考核标准 4 条 ✅
- 种子数据脚本重构为可重复执行（`deleteMany` + `upsert` 策略，避免重复插入）✅
- 创建前端 API 基础设施：`config/index.js`（API 地址）+ `utils/request.js`（请求封装/Token 注入/错误拦截）+ `utils/util.js`（工具函数）✅
- 更新 `app.js`：Token 管理 + 登录状态持久化 + 自动获取用户信息 ✅
- 登录页接入真实微信登录（`wx.login` → `POST /api/auth/login`）✅
- 首页接入 Banner/推荐 API（`GET /api/banners` + `GET /api/recommends`），保留 fallback 数据 ✅
- **全部 28 个前端页面接入真实 API**（视频3页/论坛3页/刷题3页/工具4页/训练2页/装备2页/学习2页/个人中心5页/搜索/通知/帮助/关于）✅
- 版本号 0.2.0 → 0.2.1（Bug 修复 + 新功能，补丁版本号 +1）
- 详细日志见：`feature-backend-phase4.md`

---

## 0.2.0 - 2026-06-26 - 后端 Phase 4 完成：安全加固 + 管理后台增强

- API 频率限制接入（60s/60次，防刷）✅
- 敏感词过滤系统（发帖/评论内容审核）✅
- 管理后台数据看板增强（8 项统计 + 待处理提醒）✅
- 装备报修审批管理后台（列表 + 状态流转：待处理→处理中→完成）✅
- 装备领用审批管理后台（列表 + 批准/拒绝）✅
- 推荐内容编辑功能补全（新增 update 路由 + 编辑弹窗）✅
- 补充缺失日志：`feature-backend-phase1-2.md` ✅
- 版本号 0.1.0 → 0.2.0（新功能，次版本号 +1）
- 详细日志见：`feature-backend-phase4.md`
- 详细日志见：`feature-backend-phase1-2.md`

---

## 0.1.0 - 2026-06-25 - 后端 Phase 3 完成：论坛 + 刷题 + 用户中心

- 论坛模块完整 API（帖子 CRUD + 点赞/收藏 + 评论/回复/点赞）✅
- 刷题系统完整 API（题库列表 + 题目分页 + 提交判分 + 答题历史 + 错题本）✅
- 用户中心扩展 API（我的收藏/评论/上传/学习进度）✅
- 全局搜索 API（视频/帖子/装备/学习 4 类型）✅
- 消息通知 API（通知列表 + 未读数 + 标记已读）✅
- 意见反馈 API ✅
- 管理后台新增模块：帖子审核（通过/拒绝/精华）、题库管理（题库+题目 CRUD）、用户管理（认证/禁用）、反馈管理（查看/回复）、系统设置（修改密码）✅
- 新增 8 个 EJS 管理后台视图（posts/list, quiz/banks+bank-form+questions+question-form, users/list, feedbacks/list, settings/index）✅
- API 路由注册完整（11 个 API 模块 + 15 个后台模块）✅
- 修复 Prisma Client 未生成问题（npx prisma generate）✅
- 修复错题本 API（改为 $queryRaw 解决跨字段比较问题）✅
- 版本号 0.0.9 → 0.1.0（新功能，次版本号 +1）
- 详细日志见：`feature-backend-phase3.md`
- 详细日志见：`feature-backend-phase1-2.md`

---

## 0.0.9 - 2026-06-25 - 服务器地址更换 + 后端方案设计

- 全局服务器地址替换：`xf.075098.xyz` → `www.yjjyzxy.top`（4 个文件共 9 处）
- 后端技术选型确定：Node.js + Express + Prisma + MySQL + EJS + Bootstrap 5
- 编写完整后端实施方案文档 `docs/backend-plan.md`（11 章节，含 19 张数据库表定义 + 55 API + 4 阶段路线图）
- 管理后台设计完成：13 个管理模块（视频/训练/危化品/标准/装备/学习/题库/帖子/用户/反馈/Banner/看板/设置）
- 数据库 Prisma Schema 定义完成
- 客服邮箱更新：support@xf.075098.xyz → support@yjjyzxy.top
- 详细日志见：`feature-backend-planning.md`

---

## 0.0.8 - 2026-06-25 - Bug修复：导航栏遮挡 + 布局优化

- 修复视频列表页 `video/index` 搜索框被固定导航栏遮挡（search-wrap margin-top 加入 statusBarHeight）
- 修复视频播放页 `video/play` 视频容器被固定导航栏遮挡（同上）
- 修复刷题中心 `quiz/index` Hero 搜索区被固定导航栏遮挡（同上）
- 修复刷题详情 `quiz/detail` 进度条被固定导航栏遮挡（同上）
- 增强战训工具页 `tools/index` Hero 卡片 2 列布局稳定性（`flex: 0 0` 替换 `width`）
- 增强训练操法页 `training/index` 卡片 2 列布局稳定性（同上）
- 修复论坛页 `forum/index` 签到按钮+铃铛布局：从 `justify-between` 远端分离改为紧挨标题文字右侧
- 修复个人中心页版本号显示（v0.0.4 → v0.0.8，之前漏更新）
- 详细日志见：`feature-ui-layout-optimization.md`

---

## 0.0.1 - 2026-06-25 - 前端页面框架搭建

- 基于「html预览」文件夹中的 HTML 设计稿，完整转换为微信小程序原生代码
- 创建 21 个页面（含 4 个 TabBar 页面 + 17 个子页面），共 84 个文件
- 建立全局设计系统（色彩/间距/字体/工具类）
- 完成页面间导航链接（navigator + TabBar）
- 修复 HTML 实体图标不显示问题（替换为 Unicode 字符）
- 修复多页面布局宽度异常（全局 box-sizing + 全宽适配）
- 详细日志见：`feature-frontend-pages.md`

---

## 0.0.2 - 2026-06-25 - Bug修复：余留HTML实体 + 答题逻辑

- 修复训练操法页面（4处）和器材装备页面（10处）HTML 实体未转换的 Bug，替换为 Unicode Emoji
- 修复商品详情页评价头像 HTML 实体问题
- 修复刷题中心 `quiz/detail.js` 正确答案硬编码问题，改为从 `question.correctAnswer` 字段读取
- 完善 PAGES.md：新增业务逻辑链路图、待建页面清单（15个）、数据流说明、文件清单速查
- 详细日志见：`feature-frontend-pages.md`

---

## 0.0.3 - 2026-06-25 - 全局配色重构 + 论坛跳转修复

- 全局配色方案从红蓝改为蓝白：主色 `#E60012`(消防红) → `#1a56db`(专业蓝)，次色 `#005BAC` → `#0284c7`，涉及33个文件约120处替换
- 修复论坛帖子列表无点击响应问题：添加 `onPostTap` 事件处理（跳转至 `forum/detail`，页面待建）
- 更新 PAGES.md 配色令牌文档
- 详细日志见：`feature-frontend-pages.md`

---

## 0.0.4 - 2026-06-25 - 15个待建页面全部完成 + 全局 Bug 修复 + TabBar 重构

### 新增功能
- **论坛帖子详情页** `pages/forum/detail` — 完整帖子内容展示、评论区、评论输入、相关帖子推荐
- **全局搜索结果页** `pages/search/index` — 4Tab分类搜索（课程/帖子/商品/装备）、搜索历史
- **13 个待建页面全部建完**：
  - 中优9页：训练操法详情、拓展学习详情、登录授权、答题结果、消息通知、设置、关于、帮助反馈、职业技能鉴定
  - 低优4页：我的收藏、我的评论、我的上传、编辑资料
- **自定义 TabBar 组件** `custom-tab-bar/` — 选中态图标浅蓝色光晕 + 文字始终灰色
- **答题交卷功能** — quiz/detail → quiz/result 完整流程

### Bug 修复（8 项）
- 修复 `.tag-primary` 残留旧红色背景（rgba(230,0,18,0.1) → rgba(26,86,219,0.1)）
- 修复 `.card-red` 类名错误（实际为蓝色 → `.card-primary`）
- 修复训练操法页面搜索过滤不生效（`{{trainings}}` → `{{filteredList}}`）
- 修复商城图片占位符路径不存在（替换为 Emoji fallback）
- 删除孤立 example 页面目录
- 全局搜索栏添加 bindtap 跳转（9 个页面）
- 学习页/工具页添加卡片点击响应
- 个人中心菜单项 URL 全部补完 + 搜索/设置图标响应

### 版本更新
- 版本号 0.0.3 → 0.0.4
- `project.config.json` version 字段已更新
- 个人中心页版本显示已更新
- 详细日志见：`feature-pending-pages.md`

---

## 0.0.5 - 2026-06-25 - UI布局优化 + 新页面 + 需求文档

- 视频分类网格从2列改为单列满行（加图标+渐变色背景+箭头），8个分类各占一行
- 新建视频分类详情页 `pages/video/category`（搜索框+筛选标签+视频列表+空状态），含8类共27条模拟视频数据
- 战训工具主页4个Hero卡片从1列改为2列网格布局，高度和文字适配
- 确认危化品详情理化性质已是2列、训练操法卡片已是2列（无需改动）
- 论坛帖子详情页完整实现：作者信息+帖子内容（含图片/视频）+互动数据+点赞/收藏/分享+评论区（含子回复+排序+点赞）+评论输入弹层+相关推荐
- 编写完整后端+前端需求文档 `docs/REQUIREMENTS.md`（55个API接口+19张数据库表+4阶段开发路线图）
- 详细日志见：`feature-ui-layout-optimization.md`

---

## 0.0.6 - 2026-06-25 - 删除商城模块 + 资源清理

- 删除全部商城页面代码（16个文件，4页×4），后续商城功能由微信小店替代
- app.json 移除 4 个商城页面路由 + TabBar 商城项（4Tab → 3Tab）
- custom-tab-bar 组件移除商城 Tab，同步为 3Tab
- 全局搜索页移除"商品"Tab 及相关 6 条商品数据，search Tab 从 4 → 3
- 帮助页文案移除"商城内装备"提法
- 删除 3 个超大图片资源（ai_example1.png 218KB / create_cbr.png 312KB / create_cbrf.png 197KB），解决"资源不超过 200K"警告
- PAGES.md 全面更新：版本号、页面总数（33页）、业务逻辑图、页面清单、导航流程、文件清单、app.json 配置示例
- 版本号 0.0.5 → 0.0.6
- 详细日志见：`feature-ui-layout-optimization.md`

---

## 0.0.7 - 2026-06-25 - 商城按钮恢复 + UI修复

- 恢复商城 TabBar 按钮（4Tab：首页/论坛/商城/我的），创建商城占位页 `pages/shop/index`（后续接入微信小店）
- 修复视频分类详情页搜索框被固定导航栏遮挡问题（`.search-wrap` margin-top 加入 statusBarHeight）
- 确认战训工具 Hero 卡片已是 2 列布局、训练操法卡片已是 2 列布局（v0.0.5 已改）
- 论坛页布局重组：签到按钮移至"战训论坛"标题右侧、搜索栏移至论坛头部下方独立一行、移除顶部导航栏多余元素
- 版本号 0.0.6 → 0.0.7
- 详细日志见：`feature-ui-layout-optimization.md`

