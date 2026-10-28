---
title: Qt/C++ 多用户网盘与可靠文件传输系统
description: 基于 Qt、TCP 和 MySQL 的 C/S 网盘与即时通信项目
status: active
featured: true
startDate: 2026-10-01
techStack: [C++, Qt Widgets, QTcpSocket, QTcpServer, MySQL, Redis]
tags: [C++, Qt, TCP, 网盘, 服务器开发]
links:
  - label: GitHub 源码
    url: https://github.com/liusongrui666/liusongrui666.github.io/tree/main/qt-netdisk
    type: repo
---

# 项目概述

这是一个基于 Qt 的 C/S 多用户网盘与即时通信系统。客户端使用 Qt Widgets 和 QTcpSocket，服务端使用 QTcpServer，通过自定义 PDU 协议完成用户认证、好友聊天、目录管理和文件传输。

## 核心功能

- 使用服务端密码哈希和参数化 SQL 完成认证与数据库访问。
- 使用虚拟路径映射和用户根目录隔离保护文件访问边界。
- 使用 upload_id、offset 和分片确认支持大文件分片上传与断点续传。
- 使用文件摘要索引实现重复文件检查、秒传和物理对象复用。
- 使用 TCP 接收缓冲区按协议总长度处理粘包与半包。

## 代码目录

完整 Qt 源码位于仓库根目录的 `qt-netdisk/`，其中 `Client/` 是客户端，`Server/` 是服务端。数据库和连接配置需要在本地按 `qt-netdisk/README.md` 配置，不提交真实凭据。
