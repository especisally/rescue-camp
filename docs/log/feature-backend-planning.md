# 后端技术选型与方案设计 改动记录

## 0.0.9 - 2026-06-25

### 改动类型: 新增 / 修改

#### 改动内容
- **服务器地址全面更换**：`xf.075098.xyz` → `www.yjjyzxy.top`，涉及 4 个文件共 9 处
- **后端技术选型确定**：Node.js + Express + Prisma + MySQL + EJS + Bootstrap 5
- **生成完整后端实施方案文档** `docs/backend-plan.md`（11 章节、约 800 行）
- **管理后台设计完成**：13 个管理模块（视频/训练/危化品/标准/装备/学习/题库/帖子/用户/反馈/Banner/看板/设置）
- **数据库 Schema 定义**：19 张表（Prisma），含完整字段、关联关系、索引
- **4 阶段开发路线图**：Phase 1 地基 → Phase 2 内容模块 → Phase 3 论坛+刷题 → Phase 4 用户中心+优化
- **前端接入改造清单**：列出所有待改动的页面和数据流

#### 影响范围
- 全部文档（CLAUDE.md、REQUIREMENTS.md、PAGES.md）
- 帮助页面（`miniprogram/pages/help/index/index.js`）
- 新增 `docs/backend-plan.md`
- 新增 `docs/log/feature-backend-planning.md`

#### 改动原因
- 域名更换为用户新备案域名 `www.yjjyzxy.top`
- 项目前端框架完成（36 页），需要启动后端开发
- 用户无后端经验，需要完整可执行的方案文档

#### 相关文件
- `CLAUDE.md` — 服务器地址 4 处替换
- `docs/REQUIREMENTS.md` — 服务器地址 3 处替换
- `PAGES.md` — 服务器地址 1 处替换
- `miniprogram/pages/help/index/index.js` — 客服邮箱地址替换
- `docs/backend-plan.md` — 新增，后端完整实施方案
- `docs/log/everything.md` — 新增 0.0.9 条目
- `docs/log/feature-backend-planning.md` — 本文件

#### 技术选型决策记录
| 决策项 | 选项 A | 选项 B | 最终选择 | 理由 |
|--------|--------|--------|---------|------|
| 后端语言 | Node.js | PHP/Python | **Node.js** | 前后端同语言(JS)，降低学习成本 |
| 框架 | Express | Koa/Nest | **Express** | 最简单，教程最多 |
| 数据库 | MySQL | PostgreSQL | **MySQL** | 宝塔一键安装，适合关联查询 |
| ORM | Prisma | Sequelize | **Prisma** | 类型安全，自动生成代码 |
| 后台模板 | EJS | Vue/React | **EJS** | 写 HTML 即可，不学新框架 |
| 后台样式 | Bootstrap 5 | Tailwind | **Bootstrap 5** | 开箱即用 UI 组件 |
| 文件存储 | 本地 | 腾讯云 COS | **先本地** | 量大了再迁 |

#### 注意事项
- 后端代码在新的 AI 会话窗口中实施（本文档作为执行指南）
- 宝塔面板需先安装 Node 18+MySQL 5.7+PM2
- 数据库建表使用 `npx prisma db push`（自动同步 schema）
- 版本号需同步更新 `project.config.json` 和 CLAUDE.md
