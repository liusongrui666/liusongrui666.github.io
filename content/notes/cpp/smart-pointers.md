---
title: C++ 智能指针详解
description: 深入理解 unique_ptr、shared_ptr、weak_ptr 的使用场景与底层原理
date: 2026-07-10
tags: [C++, 智能指针, 内存管理]
category: cpp
---

## 为什么需要智能指针

传统 C++ 使用 `new` / `delete` 手动管理内存，容易出现内存泄漏、悬空指针、重复释放等问题。智能指针通过 RAII（资源获取即初始化）机制，在对象生命周期结束时自动释放内存。

## unique_ptr：独占所有权

`unique_ptr` 拥有其所指对象的唯一所有权，不支持拷贝，只能移动。

```cpp
#include <memory>

std::unique_ptr<int> p1 = std::make_unique<int>(42);
std::unique_ptr<int> p2 = std::move(p1);  // 转移所有权

// p1 现在为 nullptr
// p2 持有该 int
```

### 适用场景

- 资源独占访问（如文件句柄、网络连接）
- 作为工厂函数的返回类型
- 容器中存储多态对象（`vector<unique_ptr<Shape>>`）

## shared_ptr：共享所有权

`shared_ptr` 通过引用计数实现共享所有权，最后一个 `shared_ptr` 析构时释放资源。

```cpp
auto p1 = std::make_shared<std::string>("hello");
auto p2 = p1;  // 引用计数 +1

std::cout << p1.use_count();  // 输出 2
```

## weak_ptr：打破循环引用

`weak_ptr` 不增加引用计数，用于解决 `shared_ptr` 的循环引用问题。

```cpp
struct Node {
    std::shared_ptr<Node> next;
    std::weak_ptr<Node> prev;  // 用 weak_ptr 避免循环
};
```

## 性能对比

| 指针类型 | 大小 | 引用计数开销 |
|---------|------|------------|
| `unique_ptr` | 一个指针 | 无 |
| `shared_ptr` | 两个指针 | 原子操作 |

## 最佳实践

1. **优先使用 `unique_ptr`**，仅在确实需要共享时才用 `shared_ptr`
2. **永远不要用同一裸指针初始化多个智能指针**
3. **使用 `make_unique` / `make_shared`**，避免异常泄漏
