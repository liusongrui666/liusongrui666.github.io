---
title: 常用 Linux 命令速查
description: 系统管理、文件操作、网络工具等高频命令
date: 2026-07-05
tags: [Linux, 命令行, Shell]
category: linux
---

## 文件与目录

```bash
# 列出文件
ls -lah                 # 详细列表 + 人类可读大小
ls -R | grep "*.log"    # 递归查找日志

# 切换目录
cd -                    # 返回上次所在目录
pushd / popd            # 目录栈

# 创建/删除
mkdir -p a/b/c          # 递归创建
rm -rf directory        # 强制递归删除（慎用！）
```

## 文本处理三剑客

### grep - 文本搜索

```bash
grep -rn "TODO" src/             # 递归搜索 + 显示行号
grep -i "error" log.txt          # 忽略大小写
grep -E "foo|bar" file           # 扩展正则
```

### sed - 流编辑器

```bash
sed -i 's/old/new/g' file.txt    # 原地替换
sed -n '10,20p' file             # 打印 10-20 行
```

### awk - 文本分析

```bash
awk '{print $1}' access.log      # 打印第一列
awk -F: '{print $1}' /etc/passwd # 指定分隔符
```

## 系统监控

| 命令 | 作用 |
|------|------|
| `top` / `htop` | 进程实时监控 |
| `free -h` | 内存使用 |
| `df -h` | 磁盘使用 |
| `iostat` | IO 统计 |
| `nvidia-smi` | GPU 状态 |

## 网络工具

```bash
curl -I https://example.com      # 仅查看响应头
wget -c url                      # 断点续传
ss -tulnp                        # 查看监听端口
ping -c 4 host                   # 4 次 ping
traceroute host                  # 路由追踪
```

## 权限管理

```bash
chmod 755 script.sh              # rwxr-xr-x
chown user:group file            # 改属主
sudo !!                          # 以 sudo 重新执行上条命令
```

## 进程管理

```bash
ps aux | grep nginx              # 查找进程
kill -9 PID                      # 强制终止
nohup ./script &                 # 后台运行
jobs / fg / bg                   # 任务控制
```
