# 后端 Phase 3 开发日志 — 论坛 + 刷题 + 用户中心

## 0.1.0 - 2026-06-25

### 改动类型: 新增

---

### 一、论坛模块 API

#### 新增文件
- `server/src/routes/api/posts.js` — 论坛帖子 API（7 个接口）
- `server/src/routes/api/comments.js` — 评论 API（3 个接口）
- `server/src/routes/admin/posts.js` — 帖子审核后台

#### API 接口清单
| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/posts` | 可选 | 帖子列表（tab: latest/hot/essence/resource + 分页+搜索） |
| GET | `/api/posts/:id` | 可选 | 帖子详情（自动+浏览量） |
| POST | `/api/posts` | 必需 | 发布帖子 |
| DELETE | `/api/posts/:id` | 必需 | 删除帖子（仅作者本人） |
| POST | `/api/posts/:id/like` | 必需 | 点赞/取消点赞（含通知） |
| POST | `/api/posts/:id/favorite` | 必需 | 收藏/取消收藏 |
| GET | `/api/posts/:id/comments` | 可选 | 帖子评论列表（嵌套回复 + 热/新排序） |
| POST | `/api/comments` | 必需 | 发表评论/回复（含通知帖子作者+被回复者） |
| DELETE | `/api/comments/:id` | 必需 | 删除评论（仅作者） |
| POST | `/api/comments/:id/like` | 必需 | 评论点赞/取消 |

#### 关键逻辑
- **点赞/收藏状态标记**：已登录用户在列表和详情中自动标记 `isLiked`/`isFavorited`
- **评论嵌套**：一级评论 `parentId=null`，子回复 `parentId≠null`，自动 include `replies`
- **通知生成**：点赞帖子通知作者、评论帖子通知作者、回复评论通知被回复者
- **签到**：已在 Phase 1 的 `POST /api/users/signin` 完成，含防重复和积分+5

---

### 二、刷题模块 API

#### 新增文件
- `server/src/routes/api/quiz.js` — 刷题 API（6 个接口）
- `server/src/routes/admin/quiz.js` — 题库/题目管理后台

#### API 接口清单
| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/quiz/banks` | 可选 | 题库列表（含分类+题目计数） |
| GET | `/api/quiz/banks/:id` | 可选 | 题库详情 |
| GET | `/api/quiz/banks/:id/questions` | 可选 | 题目列表（分页，隐藏正确答案） |
| POST | `/api/quiz/submit` | 必需 | 提交答题（自动判分，返回每题正误） |
| GET | `/api/quiz/records` | 必需 | 答题历史 |
| GET | `/api/quiz/records/wrong` | 必需 | 错题本（$queryRaw 实现 score < total 筛选） |

#### 判分逻辑
- 单选题：比较 `selected` == `correctAnswer`
- 多选题：比较排序后的逗号分隔字符串（`"A,B"`）
- 判断题：比较 `"对"/"错"`
- 每题返回 `{ questionId, selected, correct, correctAnswer }`

#### 管理后台
- 题库 CRUD：列表 + 新增/编辑表单 + 软删除
- 题目 CRUD：题库下钻 → 题目列表 + 新增/编辑/物理删除
- 自动更新 `questionCount` 计数

---

### 三、用户中心扩展 API

#### 修改文件
- `server/src/routes/api/users.js` — 新增 4 个接口

#### 新增接口
| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/users/me/favorites` | 必需 | 我的收藏（分页，支持 targetType 筛选） |
| GET | `/api/users/me/comments` | 必需 | 我的评论（关联帖子标题） |
| GET | `/api/users/me/uploads` | 必需 | 我的上传（帖子列表） |
| GET | `/api/users/me/progress` | 必需 | 学习进度统计（答题次数+平均分+签到次数） |

---

### 四、全局功能 API

#### 新增文件
- `server/src/routes/api/search.js` — 全局搜索（4 类型分表搜索）
- `server/src/routes/api/notifications.js` — 消息通知（列表+未读数+标记已读）
- `server/src/routes/api/feedback.js` — 意见反馈

---

### 五、管理后台扩展

#### 新增文件
- `server/src/routes/admin/posts.js` — 帖子审核（通过/拒绝/精华切换/删除）
- `server/src/routes/admin/quiz.js` — 题库+题目管理
- `server/src/routes/admin/users.js` — 用户管理（认证/禁用）
- `server/src/routes/admin/feedbacks.js` — 反馈管理（查看/回复）
- `server/src/routes/admin/settings.js` — 系统设置（管理员列表+修改密码）

#### 新增 EJS 视图
- `views/posts/list.ejs`
- `views/quiz/banks.ejs`
- `views/quiz/bank-form.ejs`
- `views/quiz/questions.ejs`
- `views/quiz/question-form.ejs`
- `views/users/list.ejs`
- `views/feedbacks/list.ejs`
- `views/settings/index.ejs`

---

### 六、Bug 修复

1. **Prisma Client 未生成** → 运行 `npx prisma generate`
2. **错题本 API 跨字段比较** → `prisma.quizRecord.fields.total` 在 JS Client 中不存在，改用 `$queryRawUnsafe` 实现 `score < total` 筛选

---

### 七、当前 API 接口完成度

**总计 57 个接口（相比需求的 55 个多了 2 个）**：

| 阶段 | 接口数 | 状态 |
|------|--------|------|
| Phase 1（地基） | 2 | ✅ |
| Phase 2（内容） | 20 | ✅ |
| Phase 3（论坛+刷题+用户） | 22 | ✅ |
| Phase 4（高级功能待做） | — | 待开发 |

**Phase 4 剩余任务**：
- [ ] 商城 API（购物车/订单/支付）— 需求文档指明由微信小店替代
- [ ] 管理员数据统计面板增强
- [ ] 文件上传 CDN/腾讯云 COS 集成
- [ ] Redis 缓存层集成
- [ ] 敏感词过滤
- [ ] 接口频率限制增强（已有简易版）

---

### 相关文件
- `server/src/routes/api/posts.js`
- `server/src/routes/api/comments.js`
- `server/src/routes/api/quiz.js`
- `server/src/routes/api/search.js`
- `server/src/routes/api/notifications.js`
- `server/src/routes/api/feedback.js`
- `server/src/routes/api/users.js`（修改）
- `server/src/routes/api/index.js`（修改）
- `server/src/routes/admin/posts.js`
- `server/src/routes/admin/quiz.js`
- `server/src/routes/admin/users.js`
- `server/src/routes/admin/feedbacks.js`
- `server/src/routes/admin/settings.js`
- `server/src/routes/admin/index.js`（修改）
- `server/views/posts/list.ejs`
- `server/views/quiz/banks.ejs`
- `server/views/quiz/bank-form.ejs`
- `server/views/quiz/questions.ejs`
- `server/views/quiz/question-form.ejs`
- `server/views/users/list.ejs`
- `server/views/feedbacks/list.ejs`
- `server/views/settings/index.ejs`

#### 注意事项
- 需要在服务器上有 MySQL 数据库才能运行（当前 .env 为本地占位配置）
- 缺少论坛帖子分类的种子数据，可在后续 `prisma/seed.js` 中补充
- 回复通知的 `targetType` 设为 `comment`，前端需要根据此类型跳转到对应评论
