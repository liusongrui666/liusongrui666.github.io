# data/

存放个人信息的静态数据文件。

| 文件 | 用途 |
|------|------|
| `resume.ts` | 简历个人信息（教育/工作/技能/奖项/语言） |
| `activity.json` | 每日活动打卡记录（修改后 push 即生效） |

## 写简历的流程

1. 打开 `data/resume.ts`
2. 取消注释模板代码，填入真实内容
3. `git add` · `commit` · `push` → Vercel 自动部署

## 记录每日活动

1. 访问 `/activity` 页面，用右侧表单
2. 点"复制 JSON 片段"
3. 粘贴到 `data/activity.json` 中
4. `git add` · `commit` · `push`

或直接编辑 `data/activity.json`，格式：

```json
{
  "2026-07-19": {
    "count": 3,
    "minutes": 90,
    "note": "做了 3 道算法题 + 复习 1 小时"
  }
}
```
