# 后端 Phase 4 开发日志 — 安全加固 + 管理后台增强

## 0.2.0 - 2026-06-26

### 改动类型: 新增

---

### 一、安全加固

#### 1.1 API 频率限制
- 文件：`server/src/app.js`（修改）
- 将 `rateLimiter` 中间件接入 Express，应用于 `/api` 路由
- 配置：每 60 秒最多 60 次请求（可调整）
- 超限返回 HTTP 429

#### 1.2 敏感词过滤
- 新增文件：`server/src/utils/sensitiveFilter.js`
  - `detect(text)` — 检测文本是否包含敏感词
  - `filter(text)` — 过滤敏感词（替换为 `*`）
  - `detectFields(fields)` — 批量检测多个字段
- 接入发帖 API：`server/src/routes/api/posts.js`
  - 发帖时检测标题和内容
  - 包含敏感词返回 422 错误
- 接入评论 API：`server/src/routes/api/comments.js`
  - 评论时检测内容
  - 包含敏感词返回 422 错误

---

### 二、管理后台增强

#### 2.1 数据看板增强
- 文件：`server/src/routes/admin/index.js`（修改）
- 文件：`server/views/dashboard/index.ejs`（重写）
- 新增统计指标：
  - 训练操法数 / 危化品数据数 / 器材装备数 / 题库数量
  - 待审核帖子数 / 未处理反馈数
- 新增待处理提醒区域（有黄色警告条）
- 保留 4 个核心指标卡片 + 快速操作按钮

#### 2.2 装备报修/领用审批管理
- 文件：`server/src/routes/admin/equipment.js`（新增审批路由）
  - `GET /admin/equipment/repairs` — 报修申请列表
  - `POST /admin/equipment/repairs/:id/process` — 标记处理中
  - `POST /admin/equipment/repairs/:id/approve` — 完成报修
  - `GET /admin/equipment/requisitions` — 领用申请列表
  - `POST /admin/equipment/requisitions/:id/approve` — 批准领用
  - `POST /admin/equipment/requisitions/:id/reject` — 拒绝领用
- 新增视图：
  - `server/views/equipment/repairs.ejs` — 报修审批列表
  - `server/views/equipment/requisitions.ejs` — 领用审批列表
- 侧边栏新增菜单：报修审批 / 领用审批

#### 2.3 推荐内容编辑功能
- 文件：`server/src/routes/admin/banners.js`（新增路由）
  - `POST /admin/recommend/:id` — 更新推荐内容
- 文件：`server/views/banners/list.ejs`（修改）
  - 新增 `editRecommend()` JS 函数
  - 推荐列表新增"编辑"按钮
  - 推荐编辑弹窗新增"状态"字段

---

### 三、其他优化

- 版本号：`0.1.0` → `0.2.0`（project.config.json / server/package.json / health API）
- 补充缺失日志：`docs/log/feature-backend-phase1-2.md`

---

### 四、当前后端接口完成度

**总计 57+ 个 API 接口**：

| 阶段 | 接口数 | 状态 |
|------|--------|------|
| Phase 1（地基） | 2 | ✅ |
| Phase 2（内容） | 26 | ✅ |
| Phase 3（论坛+刷题+用户） | 22 | ✅ |
| Phase 4（安全+增强） | — | ✅ |
| 管理后台模块 | 15 | ✅ |

**剩余可选任务**：
- [ ] 微信小程序后端接入（前端动态数据替换 mock）
- [ ] Redis 缓存层
- [ ] 文件上传迁移至腾讯云 COS
- [ ] 商城功能（微信小店替代，后端仅保留 Order 模型）
- [ ] 更多种子数据（论坛帖子、题库题目等）

---

### 相关文件
- `server/src/app.js`
- `server/src/utils/sensitiveFilter.js`（新增）
- `server/src/routes/api/posts.js`
- `server/src/routes/api/comments.js`
- `server/src/routes/admin/index.js`
- `server/src/routes/admin/equipment.js`
- `server/src/routes/admin/banners.js`
- `server/views/dashboard/index.ejs`
- `server/views/equipment/repairs.ejs`（新增）
- `server/views/equipment/requisitions.ejs`（新增）
- `server/views/banners/list.ejs`
- `server/views/layouts/main.ejs`
- `server/src/routes/api/index.js`
- `project.config.json`
- `server/package.json`

#### 注意事项
- 敏感词库为内置基础词库，生产环境建议接入专业敏感词服务
- 频率限制使用内存存储，服务重启后重置，生产环境建议换 Redis 方案
- `.env` 文件中需配置 WECHAT_APPID 和 WECHAT_SECRET 才能测试登录接口
