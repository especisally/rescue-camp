# 后端 Phase 4 开发日志 — 安全加固 + 管理后台增强

## 0.2.2 - 2026-06-26

### 改动类型: Bug 修复 + 服务器部署

---

### 一、管理后台布局修复（关键 Bug）

#### 1.1 问题根因
- 管理后台使用 `views/layouts/main.ejs` 作为页面布局，其中 `<%- body %>` 占位符期望 Express 自动填充渲染内容
- Express 标准 EJS 引擎（无 `express-ejs-layouts`）不会自动填充 `<%- body %>`，导致所有页面内容渲染在 `</html>` 标签之外
- 浏览器将页面内容丢弃，用户看到的是空白页面（只有侧边栏，无内容区）
- 上一会话（v0.2.1）已在本地做了修复，但 **`header.ejs` 和 `footer.ejs` 未被提交到 Git**，24 个视图修改也未提交
- 服务器部署的是旧代码（GitHub 唯一提交 `e5a2813`），Bug 仍然存在

#### 1.2 修复方案
- `main.ejs` 拆分为 `header.ejs` + `footer.ejs`
  - `header.ejs`：`<!DOCTYPE>` → `<head>` → 侧边栏 `<nav>` → `<main>` → `<h3>标题</h3>`
  - `footer.ejs`：`</main>` → `</div>` → 脚本 → `</body></html>`
- 24 个视图改为 include 模式：`<%- include('../layouts/header') %>` + 页面内容 + `<%- include('../layouts/footer') %>`
- 涉及文件：
  - 新增：`server/views/layouts/header.ejs`
  - 新增：`server/views/layouts/footer.ejs`
  - 修改：`server/views/dashboard/index.ejs`
  - 修改：`server/views/banners/list.ejs`
  - 修改：`server/views/chemicals/form.ejs`、`list.ejs`
  - 修改：`server/views/equipment/form.ejs`、`list.ejs`、`repairs.ejs`、`requisitions.ejs`
  - 修改：`server/views/feedbacks/list.ejs`
  - 修改：`server/views/learning/form.ejs`、`list.ejs`
  - 修改：`server/views/posts/list.ejs`
  - 修改：`server/views/quiz/bank-form.ejs`、`banks.ejs`、`question-form.ejs`、`questions.ejs`
  - 修改：`server/views/settings/index.ejs`
  - 修改：`server/views/standards/form.ejs`、`list.ejs`
  - 修改：`server/views/trainings/form.ejs`、`list.ejs`
  - 修改：`server/views/users/list.ejs`
  - 修改：`server/views/videos/form.ejs`、`list.ejs`
- 验证：登录后 `/admin/` 数据看板正常渲染 8 项统计数据 ✅

---

### 二、adminCrud JSON 字段自动解析

#### 2.1 问题描述
后台表单提交的 JSON 字段（危化品的 properties/dangers/steps/protections、装备的 specs、考核标准的 items、训练操法的 steps/equipment）以字符串形式提交，`adminCrud.js` 的 `adminCreate` 和 `adminUpdate` 直接传给 Prisma，导致类型校验失败。

#### 2.2 修复内容
- 文件：`server/src/services/adminCrud.js`
- 新增 `parseJsonFields(data)` — 自动检测以 `{` 或 `[` 开头的字符串值，尝试 `JSON.parse()`
- 新增 `removeEmptyStrings(data)` — 删除空字符串字段，避免 Prisma 类型错误
- `adminCreate` 和 `adminUpdate` 均增加了上述两个处理步骤
- 新增 `targetId` 数值类型转换

---

### 三、版本号动态读取

- 文件：`server/src/routes/api/index.js`
- `/api/health` 从硬编码 `'0.2.0'` 改为 `require('../../../package.json').version`
- 好处：版本号只需在 `package.json` 维护一处

---

### 四、新增 .gitignore

- 文件：`.gitignore`（项目根目录，新增）
- 忽略 `server.zip`（部署产物）

---

### 五、服务器部署过程

#### 5.1 服务器状态
- 服务器：`www.yjjyzxy.top`（宝塔面板，Ubuntu）
- 旧服务：`rescue-camp-api`（PM2 进程，运行旧代码 v0.2.0，非 Git 部署）
- Node.js 环境：两个版本共存
  - 系统默认：v18.19.1（`/usr/bin/node`）
  - 宝塔安装：v20.15.0（`/www/server/nodejs/v20.15.0/bin/node`）
  - PM2：宝塔安装（`/www/server/nodejs/v20.15.0/bin/pm2`）

#### 5.2 部署步骤
1. 服务器初始化 Git（原已有 `.git` 目录但无提交记录）✅
2. `git remote add origin` + `git fetch` + `git reset --hard origin/master` ✅
3. 解决目录嵌套：`.git` 上移至 `/www/wwwroot/yjjyzxy.top/`，`server/` 子目录代码就位 ✅
4. 复制/确认 `.env` 文件位置正确 ✅
5. `npx prisma generate` → Prisma Client v5.22.0 生成成功 ✅
6. `npx prisma db push` → 数据库 `rescue_camp` 已同步，无需变更 ✅
7. 环境变量配置：`export PATH="/www/server/nodejs/v20.15.0/bin:$PATH"` ✅
8. `pm2 restart rescue-camp-api` → 进程在线，版本 0.2.2 ✅

#### 5.3 部署问题处理
- PM2 命令找不到 → 用完整路径 `/www/server/nodejs/v20.15.0/bin/pm2`
- npx 下载 prisma 7.x（不兼容 Node v20.15.0）→ `Ctrl+C` 取消，用项目本地 `./node_modules/.bin/prisma`（v5.22.0）
- `pkexec`/`sudo` 弹窗 → 宝塔面板自带进程管理器，直接按 Enter 跳过
- Git 安全目录问题 → `git config --global --add safe.directory`

#### 5.4 后续更新流程
```bash
export PATH="/www/server/nodejs/v20.15.0/bin:$PATH"
cd /www/wwwroot/yjjyzxy.top
git pull
pm2 restart rescue-camp-api
```

---

### 六、验证清单

| 验证项 | 方法 | 结果 |
|--------|------|------|
| API 健康检查 | `curl https://www.yjjyzxy.top/api/health` | `{"status":"ok","db":"connected","version":"0.2.2"}` |
| 登录页加载 | `curl https://www.yjjyzxy.top/admin/login` | 200, HTML 完整 |
| 登录成功 | POST login → 302 redirect | 302 → /admin |
| 数据看板 | GET /admin/ (with cookie) | 200, 显示 8 项统计 + 快速操作 |
| Prisma 生成 | `./node_modules/.bin/prisma generate` | v5.22.0 |
| 数据库同步 | `./node_modules/.bin/prisma db push` | 已同步 |
| PM2 状态 | `pm2 list` | online, v0.2.2 |

---

### 七、Git 提交记录

```
b5111c1 fix: 管理后台布局修复 + adminCrud JSON字段处理 + 版本号修复
        31 files changed, 172 insertions(+), 27 deletions(-)
        create: .gitignore
        create: server/views/layouts/footer.ejs
        create: server/views/layouts/header.ejs
        modify: 24 view files, server/src/services/adminCrud.js,
                server/src/routes/api/index.js, docs/log/everything.md,
                server/package.json
```

---

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
