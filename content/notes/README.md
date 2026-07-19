# 笔记目录

在这里用 Markdown 写你的笔记，按分类分子目录。

## 目录结构

```
notes/
├── cpp/
│   └── example-note.md
├── linux/
│   └── example-note.md
├── algorithm/
│   └── example-note.md
└── database/
    └── example-note.md
```

## Frontmatter 模板

每个 `.md` 文件顶部需要 frontmatter：

```markdown
---
title: 笔记标题
description: 简短描述
date: 2026-07-19
tags: [标签1, 标签2]
category: cpp   # 必须与所在目录名一致
slug: my-slug   # 可选，默认用文件名
---

# 正文

从这开始写正文。
```

## 分类

支持的 `category` 值（在 `lib/categories.ts` 中定义）：
- `cpp` - C/C++
- `linux` - Linux / 系统
- `algorithm` - 算法
- `database` - 数据库

如需新增分类，去 `lib/categories.ts` 注册。

## 反向链接

在笔记中可以用 `[[slug]]` 引用其他笔记，例如：

```
参见 [[smart-pointers]] 和 [[linux/shell-scripting]]
```

未创建的链接会显示为红色虚线。
