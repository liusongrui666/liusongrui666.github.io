---
title: 深拷贝 vs 浅拷贝
description: JS 中深拷贝的几种实现方式
language: javascript
tags: [JavaScript, 深拷贝, 面试题]
createdAt: 2026-07-17
updatedAt: 2026-07-17
---

JavaScript 中对象深拷贝的常见实现方式。

## 注意

- `JSON` 方式无法处理函数、Symbol、循环引用、Date 等
- `structuredClone` 是现代浏览器原生 API，最推荐

```javascript
// 方法 1：JSON（最简单但有缺陷）
const clone1 = JSON.parse(JSON.stringify(obj));

// 方法 2：structuredClone（现代浏览器推荐）
const clone2 = structuredClone(obj);

// 方法 3：手写递归（兼容老旧环境）
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (map.has(obj)) return map.get(obj);  // 处理循环引用

  const cloneObj = Array.isArray(obj) ? [] : {};
  map.set(obj, cloneObj);

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloneObj[key] = deepClone(obj[key], map);
    }
  }
  return cloneObj;
}
```
