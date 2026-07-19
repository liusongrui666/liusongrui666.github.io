---
title: MySQL 索引原理与优化
description: B+Tree 索引、聚簇索引、覆盖索引与最左前缀
date: 2026-07-09
tags: [MySQL, 数据库, 索引]
category: database
---

## 为什么需要索引

索引是帮助 MySQL **高效获取数据**的**有序数据结构**。没有索引时需要全表扫描，时间复杂度 O(n)。

## 索引数据结构演进

### 二叉树
- 极端情况退化为链表

### 红黑树（平衡二叉树）
- 树高 O(log n)，但磁盘 IO 次数仍多（每层一次 IO）

### B-Tree（多路平衡查找树）
- 每个节点存多个 key，减少树高

### B+Tree（InnoDB 采用）
- 数据只存放在叶子节点
- 叶子节点通过链表相连，**适合范围查询**

## InnoDB 索引分类

### 聚簇索引（Clustered Index）
- 数据行就存在叶子节点
- 表必须有且仅有一个聚簇索引（通常是主键）

### 二级索引（Secondary Index）
- 叶子节点存主键值，查询需要回表

## 索引优化技巧

### 1. 最左前缀原则

联合索引 `(a, b, c)` 相当于建立了：
- `a`
- `a, b`
- `a, b, c`

但无法使用 `b` 或 `b, c` 单独查询。

```sql
-- 索引 (name, age, city)
SELECT * FROM user WHERE name = 'Tom' AND age = 20;        -- 使用索引
SELECT * FROM user WHERE age = 20;                          -- 不使用索引
```

### 2. 覆盖索引

查询列全部包含在索引中时，无需回表，极大提升性能。

```sql
-- 索引 (name, age)
SELECT name, age FROM user WHERE name = 'Tom';  -- 覆盖索引
SELECT * FROM user WHERE name = 'Tom';          -- 需要回表
```

### 3. 索引下推（ICP）

MySQL 5.6+ 特性，在索引遍历时直接过滤 WHERE 条件，减少回表次数。

### 4. 避免索引失效

```sql
-- ❌ 索引失效
SELECT * FROM user WHERE name LIKE '%Tom%';   -- 前导模糊
SELECT * FROM user WHERE YEAR(create_time) = 2026;  -- 函数运算
SELECT * FROM user WHERE age + 1 = 20;         -- 表达式

-- ✅ 走索引
SELECT * FROM user WHERE name LIKE 'Tom%';
SELECT * FROM user WHERE create_time >= '2026-01-01'
                     AND create_time < '2027-01-01';
```

## EXPLAIN 执行计划

```sql
EXPLAIN SELECT * FROM user WHERE name = 'Tom';
```

重点关注：
- `type`：system > const > eq_ref > ref > range > index > ALL
- `key`：实际使用的索引
- `rows`：扫描行数（越小越好）
- `Extra`：Using index（覆盖索引）、Using filesort（需优化）等

## 索引设计原则

1. **高频查询字段建索引**
2. **区分度高的字段优先**（如身份证号 > 性别）
3. **避免过度索引**（写入会变慢）
4. **短索引**：长字段用前缀索引
5. **常用组合查询建联合索引**
