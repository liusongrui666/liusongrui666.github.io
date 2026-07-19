---
title: C++ 智能指针示例
description: unique_ptr 与 shared_ptr 的常用模式
language: cpp
tags: [C++, 智能指针, RAII]
createdAt: 2026-07-10
updatedAt: 2026-07-10
---

展示 C++11/14/17 智能指针的常见用法。

## 关键点

- 优先使用 `make_unique` / `make_shared`
- 同一裸指针不要初始化多个智能指针
- 能用 unique_ptr 就不要用 shared_ptr

```cpp
#include <memory>
#include <iostream>

class Resource {
public:
    Resource() { std::cout << "acquired\n"; }
    ~Resource() { std::cout << "released\n"; }
};

int main() {
    // unique_ptr: 独占所有权
    std::unique_ptr<Resource> p1 = std::make_unique<Resource>();

    // 移动语义：所有权转移
    std::unique_ptr<Resource> p2 = std::move(p1);
    // p1 现在为 nullptr

    // shared_ptr: 共享所有权
    std::shared_ptr<Resource> s1 = std::make_shared<Resource>();
    std::shared_ptr<Resource> s2 = s1;  // 引用计数 = 2
    std::cout << "use_count: " << s1.use_count() << "\n";

    return 0;
}
```
