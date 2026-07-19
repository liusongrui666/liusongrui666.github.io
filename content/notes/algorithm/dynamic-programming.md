---
title: 动态规划解题套路
description: 从入门到精通，状态转移方程与优化
date: 2026-07-18
tags: [算法, 动态规划, LeetCode]
category: algorithm
---

## 动态规划三要素

1. **状态**：问题在某个阶段的抽象描述
2. **选择**：导致状态转移的决策
3. **dp 数组**：状态到数值的映射

## 解题步骤

1. 定义 dp[i] / dp[i][j] 的含义
2. 写出状态转移方程
3. 初始化边界条件
4. 决定遍历顺序
5. 举例推导验证

## 经典例题 1：爬楼梯

**问题**：每次爬 1 或 2 阶，n 阶楼梯有多少种走法？

```python
def climbStairs(n):
    if n <= 2: return n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2
    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]

# 空间优化
def climbStairs(n):
    if n <= 2: return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b
```

## 经典例题 2：最长递增子序列

```python
def lengthOfLIS(nums):
    if not nums: return 0
    n = len(nums)
    dp = [1] * n
    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)
```

## 经典例题 3：0-1 背包

**问题**：N 件物品，容量 V 的背包，每件物品有重量 w[i] 和价值 v[i]，每件只能用一次，求最大价值。

```python
def knapsack(N, V, weights, values):
    dp = [[0] * (V + 1) for _ in range(N + 1)]
    for i in range(1, N + 1):
        for j in range(1, V + 1):
            dp[i][j] = dp[i-1][j]
            if j >= weights[i-1]:
                dp[i][j] = max(dp[i][j],
                              dp[i-1][j-weights[i-1]] + values[i-1])
    return dp[N][V]

# 空间优化到一维
def knapsack(N, V, weights, values):
    dp = [0] * (V + 1)
    for i in range(N):
        for j in range(V, weights[i] - 1, -1):  # 逆序！
            dp[j] = max(dp[j], dp[j-weights[i]] + values[i])
    return dp[V]
```

## 常见套路

| 题型 | 状态定义 | 转移方向 |
|------|---------|---------|
| 路径问题 | dp[i][j] 到达格子的方案 | 通常向右/向下 |
| 序列问题 | dp[i] 前 i 个元素的最优解 | 线性 |
| 区间问题 | dp[i][j] 区间 [i,j] 的最优解 | 区间长度递增 |
| 背包问题 | dp[i][j] 前 i 个物品、容量 j | 0-1 逆序，完全正序 |
