# 后台上传 + Bug 修复 改动记录

## 0.2.4 - 2026-06-26

### 改动类型: 新增 + 修复 + 删除

---

### 一、删除器材装备页面 FAB 按钮

#### 改动内容
- 删除器材装备列表页右下角"+"悬浮按钮
- 该按钮仅为占位功能（Toast "添加器材功能开发中"），器材新增统一通过后台管理

#### 影响范围
- 器材装备列表页 `equipment/index`

#### 相关文件
- `miniprogram/pages/equipment/index.wxml` — 删除 FAB 按钮（4行）
- `miniprogram/pages/equipment/index.js` — 删除 `onFabTap()` 方法
- `miniprogram/pages/equipment/index.wxss` — 删除 `.fab` / `.fab-icon` 样式（22行）

---

### 二、修复器材装备页面数据不显示

#### 改动内容
- WXML 模板引用 `filteredList`，但 JS 设置 data 为 `equipments`，变量名不一致导致永远显示空状态
- 将 WXML 中 3 处 `filteredList` 改为 `equipments`

#### 影响范围
- 器材装备列表页数据展示

#### 相关文件
- `miniprogram/pages/equipment/index.wxml` — `filteredList` → `equipments`（第39/48/66行）

---

### 三、删除报修审批/领用审批功能

#### 改动内容
- 删除管理后台报修审批路由（列表+处理中+完成，3个端点）
- 删除管理后台领用审批路由（列表+通过+拒绝，3个端点）
- 删除 API 层报修/领用提交端点（2个 POST）
- 删除报修/领用 EJS 视图文件（2个）
- 删除管理后台侧边栏报修/领用导航链接
- 删除小程序器材详情页报修/领用底部操作栏
- 清理未使用的 post 导入和 data 字段
- Prisma 模型保留不动（避免数据库迁移风险）

#### 影响范围
- 管理后台：装备模块不再含报修/领用子菜单
- API：不再接受报修/领用申请
- 小程序：器材详情页不再显示报修/领用按钮

#### 相关文件
- `server/src/routes/admin/equipment.js` — 删除报修+领用路由（-140行）
- `server/src/routes/api/equipment.js` — 删除 repair/requisition API 端点
- `server/views/equipment/repairs.ejs` — 删除文件
- `server/views/equipment/requisitions.ejs` — 删除文件
- `server/views/layouts/header.ejs` — 删除侧边栏子菜单链接
- `server/views/layouts/main.ejs` — 同上
- `miniprogram/pages/equipment/detail.wxml` — 删除底部操作栏
- `miniprogram/pages/equipment/detail.js` — 删除 6 个方法 + 4 个 data 字段
- `miniprogram/pages/equipment/detail.wxss` — 删除 `.action-bar` 等样式

---

### 四、后台管理 URL 字段增加上传按钮

#### 改动内容
- 新建管理后台上传路由 `/admin/upload/:type`（session 认证，支持 image/video/file）
- 新建共享前端上传脚本 `upload.js`（自动绑定 `.upload-btn`，Fetch 上传 + Toast 反馈）
- 5 个表单共 9 个 URL 字段添加"📤 上传"按钮（Bootstrap input-group 样式）

#### 影响范围
- 管理后台所有内容新增/编辑表单

#### 相关文件
- `server/src/routes/admin/upload.js` — 新建（管理后台上传路由，3个端点）
- `server/src/routes/admin/index.js` — 注册 `/admin/upload` 路由
- `server/public/admin/js/upload.js` — 新建（共享上传脚本）
- `server/views/videos/form.ejs` — coverUrl + videoUrl 上传按钮
- `server/views/trainings/form.ejs` — coverUrl + videoUrl 上传按钮
- `server/views/learning/form.ejs` — coverUrl + fileUrl 上传按钮
- `server/views/equipment/form.ejs` — imageUrl 上传按钮
- `server/views/banners/list.ejs` — Banner imageUrl + Recommend coverUrl 上传按钮
- `server/views/layouts/header.ejs` — 引入 upload.js 脚本
- `server/views/layouts/main.ejs` — 引入 upload.js 脚本

---

### 五、视频上传后自动获取时长

#### 改动内容
- 上传脚本内置 `detectVideoDuration()` 函数
- 视频上传成功后创建临时 `<video>` 元素读取 `duration`
- 自动填充到表单 `[name="duration"]` 输入框

#### 影响范围
- 视频管理、训练操法、拓展学习（视频类型）的表单

#### 相关文件
- `server/public/admin/js/upload.js` — 内置 `detectVideoDuration()` 函数

---

### 六、修复视频播放页硬编码内容

#### 改动内容
- 播放页 WXML 全部硬编码文本替换为动态数据绑定
- 标题/播放量/时长/日期/标签/作者/描述 → `{{video.*}}`
- 标签改为 `wx:for` 动态渲染

#### 影响范围
- 小程序视频播放页

#### 相关文件
- `miniprogram/pages/video/play.wxml` — 9 处硬编码替换为动态绑定

---

### 测试验证
- [x] 器材装备页 FAB 按钮已删除，列表正常显示数据
- [x] 管理后台侧边栏报修/领用链接已移除
- [x] 器材详情页报修/领用按钮已移除
- [x] 管理后台各表单上传按钮正常显示
- [x] 视频上传后时长自动填充
- [x] 视频播放页内容动态显示不同视频数据
- [x] 服务器部署并重启，服务正常运行

### 版本同步
- [x] `project.config.json` — `0.2.3` → `0.2.4`
- [x] `server/package.json` — `0.2.3` → `0.2.4`
- [x] `miniprogram/pages/about/index/index.js` — `v0.2.3` → `v0.2.4`
- [x] `miniprogram/pages/profile/index.wxml` — `v0.2.3` → `v0.2.4`

### 注意事项
- 服务器已 git pull + pm2 restart（v0.2.4 已部署）
- Prisma 模型中 `RepairRequest` 和 `RequisitionForm` 保留未删除，避免数据库迁移风险
- 后续如需彻底清理，可手动删除数据库表并在 schema 中移除模型
