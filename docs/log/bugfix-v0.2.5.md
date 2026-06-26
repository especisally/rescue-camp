# Bug 修复记录 — 0.2.5

## 0.2.5 - 2026-06-26

### 改动类型: 修复 + 新增

---

## 一、上传按钮修复

### 1.1 管理后台上传脚本增强

**Bug**: 上传按钮无响应，非 JSON 响应（session 过期 HTML 跳转）时静默失败

**修复**：
- `upload.js` fetch 增加 `credentials: 'same-origin'` 确保携带 session cookie
- 响应类型检测：非 `application/json` 响应抛出"登录已过期"错误
- catch 块显示具体错误消息，不再硬编码"请检查网络"

**相关文件**：
- `server/public/admin/js/upload.js` — 增强错误处理

### 1.2 小程序上传按钮补充 fail 回调

**Bug**: `wx.chooseMedia` 无 `fail` 回调 — 权限被拒或 API 失败时无任何反馈，用户以为按钮无效

**修复**：
- `forum/post.js` `onUploadTap()` 增加 `fail` 回调（取消操作不弹 toast，真实错误提示"检查权限"）
- `forum/post.js` 增加空文件检测（`files.length === 0`）
- `profile/edit/edit.js` `onChangeAvatar()` 增加 `fail` 回调 + `wx.uploadFile` 的 fail 回调 + 成功/失败 Toast 反馈

**相关文件**：
- `miniprogram/pages/forum/post.js` — onUploadTap 增 fail + 空值检查
- `miniprogram/pages/profile/edit/edit.js` — onChangeAvatar 增完整错误链

---

## 二、题库系统修复

### 2.1 答题页无法显示选项（CRITICAL）

**Bug**: `quiz/detail.wxml` 中 `wx:for="{{question.options}}"` 默认循环变量为 `item`，但模板全部引用 `option.*`（`option.label`, `option.text`, `option.selected` 等），导致所有选项不渲染

**修复**：添加 `wx:for-item="option"` 显式命名循环变量

**根因**：微信小程序 wx:for 默认变量名为 `item` 和 `index`，使用其他名称必须通过 `wx:for-item` 指定

**相关文件**：
- `miniprogram/pages/quiz/detail.wxml` — wx:for 变量命名

### 2.2 showResult 引用错误

**Bug**: 选项条件类 `{{item.showResult && option.wrong ? 'option-wrong' : ''}}` 中 `item` 在 wx:for 内被覆盖为当前选项对象，`item.showResult` 永远为 undefined

**修复**：改为 `{{showResult && option.wrong ? 'option-wrong' : ''}}` 直接引用 Page data

**相关文件**：
- `miniprogram/pages/quiz/detail.wxml`

### 2.3 题目序号 0-based 显示

**Bug**: `第 {{currentIndex}} 题` 显示为 "第 0 题"，`已完成 {{currentIndex}}/{{totalCount}}` 显示 "已完成 0/21"

**修复**：改为 `{{currentIndex + 1}}`

**相关文件**：
- `miniprogram/pages/quiz/detail.wxml`

### 2.4 bankTitle 不更新

**Bug**: 答题页标题永远显示"题库加载中..."，未从 URL 参数或 API 获取真实标题

**修复**：
- `quiz/index.wxml` 银行卡片增加 `data-title="{{item.title}}"`
- `quiz/index.js` `onBankTap` 通过 URL 传递 `&title=` 参数（encodeURIComponent 编码）
- `quiz/detail.js` `onLoad` 解析 `options.title` 并用 `decodeURIComponent` 解码

**相关文件**：
- `miniprogram/pages/quiz/index.wxml`
- `miniprogram/pages/quiz/index.js`
- `miniprogram/pages/quiz/detail.js`

### 2.5 答题结果页完整 UI（原为占位）

**Bug**: `quiz/result.wxml` 仅含 `<text>pages/quiz/result.wxml</text>`，JS 无 UI 逻辑

**修复**：完整重写结果页
- **成绩展示区**：圆环分数 + 正确率 + 鼓励语（≥90% 🎉 / ≥80% 👍 / ≥60% 💪 / <60% 📚）
- **统计卡片**：答对数 / 答错数 / 用时
- **操作按钮**：错题回顾（仅错题>0时显示）+ 重新答题 + 返回题库
- **错题回顾区**：每题显示用户答案 vs 正确答案 + 解析（可折叠）
- **用时格式化**：秒→分秒/时分

**相关文件**：
- `miniprogram/pages/quiz/result.wxml` — 完整重写（原 2 行 → 80 行）
- `miniprogram/pages/quiz/result.wxss` — 完整重写（原 1 行 → 180 行）
- `miniprogram/pages/quiz/result.js` — 完整重写（增加 durationText / wrongList / showWrongDetail）

### 2.6 结果页错题信息传递

**Bug**: 结果页无法显示错题原文和解析（API 返回的 results 只有 questionId + selected + correctAnswer）

**修复**: `detail.js` `submitAnswers()` 在提交成功后构建 `questionMap`（id → {question, explanation}），附加到 result 对象传入 globalData

**相关文件**：
- `miniprogram/pages/quiz/detail.js`

---

## 三、视频表单"时长"框移除

**改动**：删除 `videos/form.ejs` 中可见的"时长（秒）"输入框，保留隐藏字段 `<input type="hidden" name="duration">` 供 upload.js 自动检测填充

**影响**：管理后台 → 视频管理 → 新增/编辑表单

**相关文件**：
- `server/views/videos/form.ejs` — 删除可见时长输入，保留 hidden

---

## 四、11 个页面加载空白修复（CRITICAL）

### 4.1 根因

项目存在两套并行页面文件：
1. **存根文件**（flat）：`pages/<name>/index.js` 等 — 空的 `Page({ data: {} })`，无任何逻辑
2. **真实实现**（subdirectory）：`pages/<name>/index/index.js` 等 — 完整的页面逻辑

`app.json` 注册路径为 `pages/<name>/index`，WeChat 框架优先匹配 flat 存根文件，导致 10 个页面显示空白。

受影响页面：about, certification, comments, favorites, help, login, notification, search, settings, uploads

### 4.2 修复

删除存根文件，将 `index/` 子目录中真实文件移动到父目录：

```bash
# 对每个受影响页面
rm -f pages/<name>/index.{js,wxml,wxss,json}
mv pages/<name>/index/index.{js,wxml,wxss,json} pages/<name>/
rm -rf pages/<name>/index/
```

`profile/edit` 页面结构不同（存根为 `edit.*`，真实在 `edit/edit.*`），同样处理。

### 4.3 验证

修复后 require 路径正确（真实文件原本就按 flat 结构编写 require 路径，如 `../../utils/request` 在 flat 结构下正确解析为 `miniprogram/utils/request`）

**相关文件**：
- `miniprogram/pages/about/index.*` (4 文件替换)
- `miniprogram/pages/certification/index.*` (4 文件替换)
- `miniprogram/pages/comments/index.*` (4 文件替换)
- `miniprogram/pages/favorites/index.*` (4 文件替换)
- `miniprogram/pages/help/index.*` (4 文件替换)
- `miniprogram/pages/login/index.*` (4 文件替换)
- `miniprogram/pages/notification/index.*` (4 文件替换)
- `miniprogram/pages/search/index.*` (4 文件替换)
- `miniprogram/pages/settings/index.*` (4 文件替换)
- `miniprogram/pages/uploads/index.*` (4 文件替换)
- `miniprogram/pages/profile/edit.*` (4 文件替换)

---

## 五、WXML 变量名不匹配修复

### 5.1 训练操法页列表不显示

**Bug**: WXML 引用 `wx:for="{{filteredList}}"`，JS data 中实际键名为 `trainings`

**修复**: `filteredList` → `trainings`

**相关文件**：
- `miniprogram/pages/training/index.wxml` (line 45)

### 5.2 危化品查询页列表不显示

**Bug**: WXML 引用 `filteredList`，JS data 中实际键名为 `chemicals`

**修复**: `filteredList` → `chemicals`（2 处：wx:for + wx:if empty state）

**相关文件**：
- `miniprogram/pages/tools/chemical.wxml` (lines 32, 48)

### 5.3 考核标准页列表不显示

**Bug**: WXML 引用 `filteredList`，JS data 中实际键名为 `standards`

**修复**: `filteredList` → `standards`（2 处）

**相关文件**：
- `miniprogram/pages/tools/standard.wxml` (lines 30, 45)

**根因**: 这些页面的 JS 在 v0.0.4/v0.2.4 修复时改了 data 键名（`filteredList` → `trainings`/`chemicals`/`standards`）但 WXML 模板未同步更新

---

## 六、其他 Bug 修复

### 6.1 危化品搜索 confirm 事件

**Bug**: 搜索输入框 `bindconfirm="onSearch"`，但 JS 中无此方法

**修复**: 添加 `onSearch()` 方法（重置页码 + 清空列表 + 重新获取）

**相关文件**：
- `miniprogram/pages/tools/chemical.js`

### 6.2 通知页标记已读失效

**Bug**: WXML 未传递 `data-id`，JS 执行 `POST /notifications/undefined/read`

**修复**: 添加 `data-id="{{item.id}}"`
**相关文件**：
- `miniprogram/pages/notification/index.wxml`

### 6.3 设置页退出登录不完整

**Bug**: 仅设置 `globalData.isLoggedIn = false`，未清除 token，重开小程序自动登录

**修复**: 改为调用 `app.logout()`（清除 token + globalData + storage）

**相关文件**：
- `miniprogram/pages/settings/index.js`

---

## 七、新增题目导入模板

**新增**：
- `docs/templates/quiz-question-template.json` — JSON 格式模板（含 3 道示例题）
- `docs/templates/quiz-question-template.csv` — CSV 格式模板（Excel 可编辑，含 5 道示例题）
- `docs/templates/README.md` — 模板使用说明（字段说明 + 格式示例 + 导入方式）

**模板字段**：题型(type)、题目(question)、选项(options[{label,text}])、正确答案(correctAnswer)、解析(explanation)

---

## 版本同步

- [x] `project.config.json` — `0.2.4` → `0.2.5`
- [x] `server/package.json` — `0.2.4` → `0.2.5`
- [x] `miniprogram/pages/about/index.js` — `v0.2.4` → `v0.2.5`
- [x] `miniprogram/pages/profile/index.wxml` — `v0.2.4` → `v0.2.5`

## 测试验证

- [ ] 管理后台上传按钮：点击 → 文件选择器打开 → 上传 → URL 自动填充
- [ ] 小程序发帖上传：点击上传区域 → 选择图片/视频 → 上传成功 Toast
- [ ] 题库列表 → 点击题库 → 标题正确显示 → 选项正确渲染
- [ ] 答题 → 选择选项 → 正确/错误标记显示 → 解析显示
- [ ] 交卷 → 结果页完整显示（分数/统计/用时/错题回顾）
- [ ] 训练操法页：列表正常显示（非空白）
- [ ] 危化品查询页：列表正常显示
- [ ] 考核标准页：列表正常显示
- [ ] 设置页退出登录：token 正确清除
- [ ] 关于/搜索/通知/帮助等 10 个页面：正常显示非空白

## 已知遗留问题

1. **forum/detail.js** 仍使用 mock 数据（`detail/detail.js` 有真实 API 实现但未替换，需评估数据结构兼容性后迁移）
2. **training/detail** 和 **learning/detail** 存在两套并行实现，需清理冗余
3. **quiz/result** 存在旧子目录冗余文件（`result/result.*`），可清理
