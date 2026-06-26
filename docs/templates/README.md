# 题目导入模板说明

## 模板文件

| 文件 | 用途 |
|------|------|
| `quiz-question-template.json` | JSON 格式模板（可直接用于程序导入） |
| `quiz-question-template.csv` | CSV 格式模板（Excel/WPS 可编辑） |

## 题目字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | ✅ | 题型：`single`（单选）、`multi`（多选）、`judge`（判断） |
| `question` | string | ✅ | 题目内容 |
| `options` | array | ✅ | 选项列表，每个选项含 `label`（A/B/C/D）和 `text` |
| `correctAnswer` | string | ✅ | 正确答案：单选填字母如 `A`，多选填逗号分隔如 `A,B,D`，判断填 `A`（对）或 `B`（错） |
| `explanation` | string | - | 题目解析（选填，建议填写） |

## JSON 格式示例

```json
{
  "type": "single",
  "question": "题目内容",
  "options": [
    { "label": "A", "text": "选项A内容" },
    { "label": "B", "text": "选项B内容" },
    { "label": "C", "text": "选项C内容" },
    { "label": "D", "text": "选项D内容" }
  ],
  "correctAnswer": "A",
  "explanation": "解析内容"
}
```

## CSV 格式说明

1. 用 Excel/WPS 打开 `quiz-question-template.csv`
2. 按模板格式填写题目
3. **题型列**必须填写：`single`、`multi`、`judge` 之一
4. **判断题**只需填写选项A（"正确"）和选项B（"错误"），选项C/D留空
5. **多选题**正确答案用英文逗号分隔，如 `A,B,D`
6. 保存为 CSV UTF-8 格式

## 导入方式

目前通过管理后台逐题添加：
1. 登录管理后台 → 题库管理
2. 选择目标题库 → 新增题目
3. 按模板填写各字段
4. 选项以 JSON 格式填入，如：
   ```json
   [{"label":"A","text":"选项内容"},{"label":"B","text":"选项内容"}]
   ```

> 批量导入功能开发中，届时可直接上传 JSON/CSV 文件。
