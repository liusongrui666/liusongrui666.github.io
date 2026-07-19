---
title: Redis 数据结构与持久化
description: 五大数据类型、底层结构、RDB 与 AOF 持久化
date: 2026-07-16
tags: [Redis, 数据库, 缓存]
category: database
---

## Redis 五大数据类型

| 类型 | 底层结构 | 典型场景 |
|------|---------|---------|
| String | SDS (简单动态字符串) | 缓存、计数器 |
| List | 双向链表 / 快速列表 | 消息队列、最新列表 |
| Hash | 哈希表 / 压缩列表 | 对象属性存储 |
| Set | 哈希表 / 整数数组 | 标签、共同好友 |
| ZSet | 跳表 + 哈希表 | 排行榜、延迟队列 |

## 底层数据结构

### SDS（Simple Dynamic String）
- 记录字符串长度 O(1)
- 杜绝缓冲区溢出
- 减少内存重分配（空间预分配 + 惰性释放）

### 跳表（SkipList）
ZSet 的核心实现，平均 O(log n)，比红黑树实现简单且支持范围操作。

```c
// 跳表节点结构（简化）
typedef struct zskiplistNode {
    sds ele;
    double score;
    struct zskiplistNode *backward;
    // 层级数组，level[i] 指向第 i 层下一个节点
    struct zskiplistLevel {
        struct zskiplistNode *forward;
        unsigned long span;
    } level[];
} zskiplistNode;
```

## 持久化机制

### RDB（快照）

定时将内存数据全量写入磁盘。

```bash
# redis.conf
save 900 1           # 900 秒内至少 1 个 key 变化则触发
save 300 10
save 60 10000

# 手动触发
SAVE                # 阻塞主进程
BGSAVE              # fork 子进程
```

**优点**：单文件、适合备份、恢复快
**缺点**：可能丢失最后一次快照后的数据

### AOF（追加日志）

记录每条写命令，恢复时重放。

```bash
appendonly yes
appendfsync everysec   # 折中方案：每秒刷盘
```

**优点**：数据更完整（最多丢 1 秒）
**缺点**：文件大、恢复慢

### 混合持久化（Redis 4.0+）

AOF 文件中包含 RDB 快照 + 增量 AOF，兼顾两者优点。

## 常见问题

### 缓存雪崩
大量 key 同时过期 → 数据库压力骤增。
- **解法**：过期时间加随机值

### 缓存穿透
查询不存在的数据 → 请求直达数据库。
- **解法**：布隆过滤器、缓存空值

### 缓存击穿
热点 key 过期瞬间被大量请求。
- **解法**：分布式锁、逻辑过期、永不过期

## 性能建议

1. **避免大 key**（如存几 MB 的 String）
2. **禁用危险命令**：`KEYS`、`FLUSHALL`（用 `SCAN` 替代）
3. **合理设置最大内存** + 淘汰策略（`allkeys-lru`）
4. **Pipeline 批量操作**减少网络往返
