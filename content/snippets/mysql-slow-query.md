---
title: MySQL 慢查询分析
description: 排查 MySQL 慢查询的常用 SQL
language: sql
tags: [MySQL, 性能优化, 慢查询]
createdAt: 2026-07-18
updatedAt: 2026-07-18
---

定位和分析 MySQL 慢查询的常用 SQL 语句。

```sql
-- 1. 查看当前是否开启慢查询日志
SHOW VARIABLES LIKE 'slow_query_log';

-- 2. 开启慢查询日志（临时）
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- 阈值 1 秒
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

-- 3. 查看慢查询数量
SHOW GLOBAL STATUS LIKE 'Slow_queries';

-- 4. 查询最慢的 10 条 SQL
SELECT * FROM mysql.slow_log
ORDER BY query_time DESC
LIMIT 10;

-- 5. 找出未使用索引的查询
SELECT * FROM mysql.slow_log
WHERE rows_examined > 1000
ORDER BY query_time DESC;
```
