# 待建页面补完 改动记录

## 0.0.4 - 2026-06-25

### 改动类型: 新增 + 修复

#### 改动内容

**1. 论坛帖子详情页 (pages/forum/detail) — 高优先级**

新建完整帖子详情页，支持：
- 从 `forum/index` 的 `onPostTap` 跳转，接收 `id` 参数
- 帖子完整内容展示（标题、正文、图片网格、视频占位）
- Mock 评论列表（5条，包含回复）
- 底部评论输入栏（输入+发送）
- 点赞/收藏/分享互动按钮
- 相关帖子推荐（从同一数据池排除当前帖子）
- 4 个文件：detail.json / detail.js / detail.wxml / detail.wxss

**2. 全局搜索结果页 (pages/search/index) — 高优先级**

新建搜索功能页，支持：
- 4 个分类 Tab：课程/帖子/商品/装备
- 搜索历史（本地存储 `wx.setStorageSync`，最多10条）
- Mock 数据池覆盖四大分类（课程8条、帖子4条、商品6条、装备6条）
- 关键词匹配标题和副标题
- 搜索历史点击直接搜索
- 空状态和初始状态 UI
- 4 个文件：index.json / index.js / index.wxml / index.wxss

**3. 自定义 TabBar 组件 (custom-tab-bar/) — TabBar 重构**

解决微信原生 TabBar 无法分离文字和图标颜色的问题：
- 新建 `custom-tab-bar/` 目录（4 文件：index.json / index.js / index.wxml / index.wxss）
- 选中态：图标显示 `selectedIconPath` + 浅蓝色半透明光晕背景（`rgba(135,206,235,0.3)`）
- 文字始终为 `#5a5a5a` 灰色（无论选中与否）
- `app.json` 添加 `"custom": true`
- 4 个 Tab 页面添加 `onShow` → `getTabBar().setData({selected: N})`

**4. 中优先级页面 (9 页)**

| 页面 | 路径 | 文件数 | 核心内容 |
|------|------|--------|---------|
| 训练操法详情 | `pages/training/detail/` | 4 | Hero banner + 步骤时间线 + 装备清单 + 安全注意 |
| 拓展学习详情 | `pages/learning/detail/` | 4 | 视频区/文档预览 + 内容描述 + 相关推荐 |
| 登录/授权 | `pages/login/index/` | 4 | Logo + 微信登录按钮 + 隐私协议 |
| 答题结果 | `pages/quiz/result/` | 4 | 得分圆环 + 对错统计 + 答题回顾 + 错题本 |
| 消息通知 | `pages/notification/index/` | 4 | 通知列表 + 未读标记 + 全部已读 |
| 设置 | `pages/settings/index/` | 4 | 开关列表 + 清除缓存 + 退出登录 |
| 关于 | `pages/about/index/` | 4 | Logo + 版本号 + 功能介绍 + 版权 |
| 帮助反馈 | `pages/help/index/` | 4 | FAQ 手风琴 + 反馈提交 |
| 职业技能鉴定 | `pages/certification/index/` | 4 | 4等级鉴定信息卡片 |

**5. 低优先级页面 (4 页)**

| 页面 | 路径 | 文件数 | 核心内容 |
|------|------|--------|---------|
| 我的收藏 | `pages/favorites/index/` | 4 | 3Tab(帖子/课程/商品) + 列表 |
| 我的评论 | `pages/comments/index/` | 4 | 评论列表（原文+我的评论+时间）|
| 我的上传 | `pages/uploads/index/` | 4 | 上传列表（状态：已发布/审核中/已驳回）|
| 编辑资料 | `pages/profile/edit/` | 4 | 头像 + 表单（姓名/单位/职务/电话）|

**6. Bug 修复（8 项）**

| # | 文件 | 问题 | 修复 |
|---|------|------|------|
| 1 | `app.wxss:163` | `.tag-primary` 背景为旧红色 `rgba(230,0,18,0.1)` | → `rgba(26,86,219,0.1)` |
| 2 | `tools/index.wxss:92` + `.wxml:23` | `.card-red` 类名与实际蓝色不符 | → `.card-primary` |
| 3 | `training/index.wxml:45` | 模板遍历 `{{trainings}}` 导致搜索过滤失效 | → `{{filteredList}}`，加 `bindtap` |
| 4 | `shop/detail.js cart.js order.js` + `.wxml` | 引用 `/images/shop/placeholder.png` 不存在 | 改为空字符串 + Emoji fallback |
| 5 | `pages/example/` | 孤立目录，未注册 | 删除整个目录 |
| 6 | 9个页面 WXML + JS | 搜索栏无功能 | 添加 `bindtap="onSearchTap"` + handler |
| 7 | `learning/index` WXML + JS | 视频/资料卡片无点击响应 | 添加 `onVideoTap`/`onDocTap` |
| 8 | `profile/index.js` | 6个菜单项 `url: ''` | 改为对应页面路径 |

**7. 连接功能完善**

- `quiz/detail.js` → 添加 `onFinish()` 方法 + "交卷" 按钮，跳转至 `quiz/result`
- `quiz/detail.wxml` → 添加橙色 "交卷" 按钮（在上一题和下一题之间）
- `profile/index.js` → `toggleLogin` 改为跳转 `/pages/login/index`
- `profile/index.js` → `onEditProfile` 改为跳转 `/pages/profile/edit`
- 版本号 `v0.0.3` → `v0.0.4`

#### 影响范围

**新建文件**：65 个（15 个页面 × 4 文件 + 4 个 custom-tab-bar 文件 + 1 个日志文件）

**修改文件**：约 22 个
- `app.json` — 注册全部 15 个新页面 + custom TabBar
- `app.wxss` — 修复 `.tag-primary` 
- `project.config.json` — 版本号
- 4 个 Tab 页面 JS — 添加 `onShow` + `getTabBar()`
- 10 个页面 JS/WXML — 添加搜索/点击/导航处理器
- `tools/index.wxss` + `.wxml` — `.card-red` → `.card-primary`
- `training/index.wxml` — `filteredList` 修复
- 3 个商城页面 JS/WXML — 图片占位符修复
- `profile/index.js` + `.wxml` — 菜单 URL + 登录/版本
- `quiz/detail.js` + `.wxml` + `.wxss` — 交卷按钮
- `PAGES.md` — 更新页面清单和状态
- `docs/log/everything.md` — 添加 0.0.4 条目

**当前总计**：36 个页面（21 旧 + 15 新），约 144 个页面文件 + 4 custom-tab-bar 文件

#### 改动原因
- 15 个待建页面导致多处"断头路"——用户点击无响应或仅显示 toast
- 全局搜索功能缺失，所有搜索栏仅为装饰
- TabBar 颜色方案需调整（文字不变色 + 图标浅蓝）
- 多个 UI bug 影响用户体验（颜色残留、图片缺失、过滤失效）

#### 测试验证
- 微信开发者工具中可正常预览所有 36 个页面
- 论坛帖子列表 → 详情页跳转正常
- 全局搜索 → 分类搜索 → 结果展示正常
- 自定义 TabBar 选中态光晕效果正常
- 训练操法搜索过滤正常
- 商城图片 Emoji 占位正常
- 所有旧页面的红色残留已清除
- 待真机验证

#### 注意事项
- 所有新增页面仍使用静态 Mock 数据，后续需接入真实 API
- 自定义 TabBar 的浅蓝色光晕通过 CSS `rgba(135,206,235,0.3)` 实现，如需调整颜色改此值
- 答题交卷逻辑以 `sheetList` 中 `done: true` 的数量作为正确题数（临时方案，实际应统计真实正确题数）
- 登录页仍为模拟流程（微信登录按钮仅显示 toast），需后续接入微信授权
- `pages/example/` 目录已删除，如需要示例代码请参考其他页面
