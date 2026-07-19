# 项目目录

每个项目一个子目录，里面放 `index.md`。

## 目录结构

```
projects/
├── my-project/
│   └── index.md
└── another-project/
    └── index.md
```

## Frontmatter 模板

```markdown
---
title: 项目名称
description: 一句话描述
status: active          # active | maintained | archived | wip
featured: true          # 是否在首页/简历置顶
startDate: 2026-01-01
endDate: 2026-07-01     # 可选，不填则"至今"
techStack: [Next.js, TypeScript, Tailwind]
tags: [web, fullstack]
links:
  - label: 在线 Demo
    url: https://example.com
    type: demo
  - label: GitHub
    url: https://github.com/xxx/yyy
    type: repo
---

# 项目正文

详细描述项目背景、技术方案、成果。
```
