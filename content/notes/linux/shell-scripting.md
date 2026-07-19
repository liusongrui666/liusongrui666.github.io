---
title: Shell 脚本编程入门
description: Bash 脚本语法、变量、循环、函数
date: 2026-07-12
tags: [Linux, Shell, Bash]
category: linux
---

## 第一个脚本

```bash
#!/bin/bash
# 脚本注释以 # 开头

echo "Hello, World!"
```

保存为 `hello.sh`，添加执行权限：

```bash
chmod +x hello.sh
./hello.sh
```

## 变量

```bash
# 定义变量（等号两边不能有空格）
name="Alice"
age=25

# 使用变量
echo "Name: $name, Age: $age"

# 只读变量
readonly PI=3.14

# 命令结果赋值
current_date=$(date +%Y-%m-%d)
file_count=$(ls | wc -l)
```

## 条件判断

```bash
if [ -f "$file" ]; then
    echo "文件存在"
elif [ -d "$file" ]; then
    echo "是目录"
else
    echo "不存在"
fi
```

### 常用判断符

| 表达式 | 含义 |
|--------|------|
| `-f file` | 是普通文件 |
| `-d dir` | 是目录 |
| `-e path` | 存在 |
| `-z str` | 字符串为空 |
| `-n str` | 字符串非空 |
| `a -eq b` | 数值相等 |
| `a -lt b` | 数值小于 |

## 循环

```bash
# for 循环遍历列表
for fruit in apple banana cherry; do
    echo "I like $fruit"
done

# for 循环 C 风格
for ((i=0; i<5; i++)); do
    echo "i = $i"
done

# while 循环
count=0
while [ $count -lt 3 ]; do
    echo "Count: $count"
    ((count++))
done
```

## 函数

```bash
greet() {
    local name=$1   # 局部变量
    echo "Hello, $name"
}

greet "Bob"

# 返回值
add() {
    return $(($1 + $2))
}
add 3 5
echo $?  # 8
```

## 实战示例：批量重命名

```bash
#!/bin/bash
# 将所有 .txt 改为 .md
for file in *.txt; do
    mv "$file" "${file%.txt}.md"
done
echo "重命名完成"
```

## 调试技巧

```bash
bash -x script.sh     # 打印每条执行的命令
set -e                # 遇到错误立即退出
set -u                # 使用未定义变量时报错
```
