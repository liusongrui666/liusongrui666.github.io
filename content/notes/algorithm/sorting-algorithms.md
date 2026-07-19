---
title: 十大经典排序算法
description: 冒泡、选择、插入、希尔、归并、快速、堆、计数、桶、基数排序
date: 2026-07-08
tags: [算法, 排序, 数据结构]
category: algorithm
---

## 复杂度总览

| 算法 | 平均时间 | 最坏时间 | 空间 | 稳定性 |
|------|---------|---------|------|--------|
| 冒泡排序 | O(n²) | O(n²) | O(1) | 稳定 |
| 快速排序 | O(n log n) | O(n²) | O(log n) | 不稳定 |
| 归并排序 | O(n log n) | O(n log n) | O(n) | 稳定 |
| 堆排序 | O(n log n) | O(n log n) | O(1) | 不稳定 |
| 希尔排序 | O(n^1.3) | O(n²) | O(1) | 不稳定 |

## 快速排序（重点）

分治思想：选基准 → 小左大右 → 递归。

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
```

## 归并排序

分治 + 合并，左右两半各自排序后合并。

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

## 堆排序

利用堆这种数据结构，近似完全二叉树。

```python
def heap_sort(arr):
    n = len(arr)
    # 建堆
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    # 逐个提取
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)

def heapify(arr, n, i):
    largest = i
    l, r = 2*i+1, 2*i+2
    if l < n and arr[l] > arr[largest]: largest = l
    if r < n and arr[r] > arr[largest]: largest = r
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)
```

## 选择建议

- **小数据量**：插入排序
- **一般场景**：快速排序
- **要求稳定**：归并排序
- **内存敏感**：堆排序
- **近乎有序**：冒泡排序（带标志位优化）
