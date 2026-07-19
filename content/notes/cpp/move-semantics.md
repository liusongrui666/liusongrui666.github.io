---
title: C++ 移动语义与右值引用
description: 理解 std::move、右值引用和完美转发
date: 2026-07-15
tags: [C++, 移动语义, 性能优化]
category: cpp
---

## 左值 vs 右值

- **左值（lvalue）**：有持久存储的对象，可以取地址
- **右值（rvalue）**：临时对象、字面量，无法取地址

```cpp
int a = 10;     // a 是左值
int b = a + 1;  // a + 1 是右值（临时值）
```

## 右值引用

使用 `&&` 声明右值引用，只能绑定到右值：

```cpp
int&& r = 42;           // OK，绑定到字面量
int a = 10;
int&& r2 = a;            // Error，不能绑定到左值
int&& r3 = std::move(a); // OK，std::move 转为右值
```

## std::move 与移动构造

`std::move` 并不真正"移动"任何东西，它只是将左值强制转换为右值引用，从而可以使用移动构造函数。

```cpp
class Buffer {
    char* data_;
    size_t size_;
public:
    // 移动构造函数
    Buffer(Buffer&& other) noexcept
        : data_(other.data_), size_(other.size_) {
        other.data_ = nullptr;  // 源对象置空
        other.size_ = 0;
    }
};

Buffer b1(1024);
Buffer b2 = std::move(b1);  // 调用移动构造，b1 不再持有资源
```

## 完美转发

`std::forward` 配合模板参数 `T&&` 实现完美转发，保持参数的左值/右值属性。

```cpp
template <typename T>
void wrapper(T&& arg) {
    foo(std::forward<T>(arg));  // 完美转发
}
```

## 性能收益

对于包含动态内存的对象（如 `std::vector`、`std::string`），移动操作比拷贝快几个数量级，因为只是指针交换。
