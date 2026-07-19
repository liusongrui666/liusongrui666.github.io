# 代码片段目录

每个片段一个 `.md` 文件，**第一个代码块**会自动作为"主代码"展示。

## 文件命名

直接用 slug 命名，例如 `quick-sort.md` → `/snippets/quick-sort`。

## Frontmatter 模板

```markdown
---
title: 快速排序
description: 经典快排的 Python 实现
language: python        # python | cpp | javascript | bash | sql | go | ...
tags: [sort, algorithm]
createdAt: 2026-01-01
updatedAt: 2026-07-19
---

```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[0]
    return [x for x in arr[1:] if x < pivot] + [pivot] + [x for x in arr[1:] if x >= pivot]
```

## 说明

正文可写用法说明、复杂度分析等。
```
