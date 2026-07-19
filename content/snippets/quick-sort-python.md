---
title: 快速排序（Python）
description: 原地分区版本的快速排序
language: python
tags: [算法, 排序, Python]
createdAt: 2026-07-08
updatedAt: 2026-07-08
---

原地分区实现，空间复杂度 O(log n)，平均时间 O(n log n)。

## 复杂度

- **时间**：平均 O(n log n)，最坏 O(n²)
- **空间**：O(log n)（递归栈）
- **稳定性**：不稳定

```python
def quick_sort(arr, lo=0, hi=None):
    if hi is None:
        hi = len(arr) - 1
    if lo < hi:
        p = partition(arr, lo, hi)
        quick_sort(arr, lo, p - 1)
        quick_sort(arr, p + 1, hi)

def partition(arr, lo, hi):
    pivot = arr[hi]
    i = lo - 1
    for j in range(lo, hi):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[hi] = arr[hi], arr[i+1]
    return i + 1

# 测试
data = [3, 6, 8, 10, 1, 2, 1]
quick_sort(data)
print(data)  # [1, 1, 2, 3, 6, 8, 10]
```
