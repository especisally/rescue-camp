# [Bug修复] 种子数据缺失导致小程序无数据

## 0.2.3 - 2026-06-26

### 改动类型: 修复

---

#### 问题现象

1. **管理后台修改数据后，小程序预览不显示**
2. **后台中已存在的基础数据，在小程序中也没有**
3. 具体表现：论坛页空白、首页推荐区空白、拓展学习页空白

---

#### 问题诊断过程

##### 第 1 步：验证 API 服务器状态
```
GET /api/health → {"status":"ok","db":"connected","version":"0.2.2"}  ✅ 正常
```

##### 第 2 步：逐表测试 API 返回数据

| API | 预期 | 实际 | 状态 |
|-----|------|------|------|
| `/api/banners` | 3 条 | 3 条 | ✅ |
| `/api/videos` | 4 条 | 4 条 | ✅ |
| `/api/chemicals` | 4 条 | 4 条 | ✅ |
| `/api/trainings` | 4 条 | 4 条 | ✅ |
| `/api/standards` | 4 条 | 4 条 | ✅ |
| `/api/equipment` | 6 条 | 6 条 | ✅ |
| `/api/quiz/banks` | 3 个(21题) | 3 个(21题) | ✅ |
| **`/api/posts`** | **5 条** | **0 条** | ❌ |
| **`/api/recommends`** | **5 条** | **0 条** | ❌ |
| **`/api/comments`** | **6 条** | **0 条** | ❌ |
| **`/api/learning`** | **应有数据** | **0 条** | ❌ |

##### 第 3 步：分析种子数据脚本 `seed.js`

种子脚本执行顺序：
```
1. Admin ✅
2. Categories ✅
3. Banners ✅ (deleteMany + create)
4. Videos ✅
5. Chemicals ✅
6. Standards ✅
7. Trainings ✅
8. Equipment ✅
9. Quiz Banks + Questions ✅
10. Posts ❌ ← 在这里崩溃！
11. Comments (未执行到)
12. Recommends (未执行到)
```

崩溃原因：
```javascript
// seed.js 中这段代码：
const posts = [
  {
    title: '...',
    userId: 1,  // ← 硬编码 userId=1，但数据库没有这个用户！
    ...
  },
];
for (const post of posts) {
  await prisma.post.create({ data: post });  // ← 外键约束报错
}
```

Prisma schema 中 Post 模型有强制外键：
```prisma
model Post {
  userId Int @map("user_id")
  user   User @relation(fields: [userId], references: [id])  // ← 外键约束
}
```

##### 第 4 步：验证诊断

在服务器上手动测试确认：`users` 表为空（没有 id=1 的用户），帖子创建失败。

---

#### 修复方法

##### 修复 1：`server/prisma/seed.js`

在帖子创建前，添加测试用户：
```javascript
let testUser = await prisma.user.findFirst({ where: { openid: 'seed_test_user_001' } });
if (!testUser) {
  testUser = await prisma.user.create({
    data: {
      openid: 'seed_test_user_001',
      nickname: '消防员小王',
      level: '认证用户',
      role: 'certified',
      points: 100,
    },
  });
}
// 所有 userId 引用从硬编码 1 改为 testUser.id
```

同时新增 6 条拓展学习种子数据。

##### 修复 2：新增 `server/prisma/fix-missing-data.js`

设计一个**只补充缺失数据、不删除已有数据**的脚本：
- 检查 User → 不存在则创建
- 检查 Posts → 不存在则创建（记录实际 ID）
- 检查 Comments → 不存在则创建（使用实际帖子 ID，含子回复的 parentId）
- 检查 Recommends → 不存在则创建（使用实际视频/训练/帖子 ID）
- 检查 Learning → 不存在则创建

关键改进：不再硬编码 ID，而是从数据库查询实际 ID：
```javascript
// 创建帖子后记录实际 ID
const created = await prisma.post.create({ data: post });
postIds.push(created.id);

// 创建评论时使用实际帖子 ID（而非假设为 1,2,3,4）
const p1 = postIds[0]; // 高层建筑灭火... 的实际 ID
await prisma.comment.create({ data: { userId: testUser.id, postId: p1, ... } });
```

---

#### 影响范围

| 影响 | 说明 |
|------|------|
| `server/prisma/seed.js` | 添加测试用户 + 动态 userId + 拓展学习种子数据 |
| `server/prisma/fix-missing-data.js` | 新增：只补充缺失数据的安全脚本 |
| 数据库 posts 表 | 从 0 条 → 5 条 |
| 数据库 comments 表 | 从 0 条 → 6 条 |
| 数据库 recommends 表 | 从 0 条 → 5 条 |
| 数据库 learning 表 | 从 0 条 → 6 条 |
| 小程序论坛页 | 从空白 → 显示 5 篇帖子 |
| 小程序首页推荐区 | 从空白 → 显示推荐内容 |
| 小程序拓展学习页 | 从空白 → 显示 6 条学习内容 |

---

#### 相关文件

- `server/prisma/seed.js` — 添加测试用户、动态 ID、拓展学习数据
- `server/prisma/fix-missing-data.js` — 新增：补充缺失数据的安全脚本
- `docs/log/everything.md` — 添加 0.2.3 改动记录
- `docs/log/bugfix-seed-data.md` — 本文档
- `server/package.json` — 版本号 0.2.2 → 0.2.3
- `project.config.json` — 版本号 0.2.2 → 0.2.3

---

#### 服务器部署步骤

```bash
# 1. SSH/宝塔终端登录服务器
cd /www/wwwroot/yjjyzxy.top
export PATH="/www/server/nodejs/v20.15.0/bin:$PATH"

# 2. 拉取最新代码
git pull

# 3. 运行修复脚本
cd server
node prisma/fix-missing-data.js

# 4. 验证
curl https://www.yjjyzxy.top/api/posts | python3 -m json.tool
curl https://www.yjjyzxy.top/api/recommends | python3 -m json.tool
curl https://www.yjjyzxy.top/api/learning | python3 -m json.tool
```

---

#### 测试验证

- [x] 本地 API 测试：banners/videos/chemicals/trainings/standards/equipment/quiz 均正常返回数据
- [ ] 服务器运行 fix-missing-data.js 后：
  - [ ] `GET /api/posts` 应返回 5 篇帖子
  - [ ] `GET /api/recommends` 应返回 5 条推荐
  - [ ] `GET /api/learning` 应返回 6 条学习内容
  - [ ] `GET /api/posts/:id/comments` 应返回评论
- [ ] 微信开发者工具中小程序首页显示推荐内容
- [ ] 微信开发者工具中论坛页显示帖子列表

---

#### 经验教训

1. **种子数据中涉及外键引用时，必须先创建被引用的数据**（如 Posts 需要 User）
2. **MySQL 的 AUTO_INCREMENT 不会因 DELETE 而重置**，不要假设 ID 从 1 开始
3. **增补数据的脚本应设计为"幂等"**（可重复执行不报错）
4. **使用动态查询获取实际 ID**，而不是硬编码
