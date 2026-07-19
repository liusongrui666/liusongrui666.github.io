---
title: Bash 一键部署脚本
description: 部署 Node.js 应用的标准脚本
language: bash
tags: [Bash, DevOps, 部署]
createdAt: 2026-07-15
updatedAt: 2026-07-15
---

适用于个人项目的轻量部署脚本：拉取最新代码、重新安装依赖、重启服务。

```bash
#!/bin/bash
set -e

APP_DIR="/var/www/myapp"
SERVICE_NAME="myapp"

echo "==> 拉取最新代码"
cd $APP_DIR
git pull origin main

echo "==> 安装依赖"
npm ci --production

echo "==> 重新构建"
npm run build

echo "==> 重启服务"
systemctl restart $SERVICE_NAME

echo "==> 部署完成"
systemctl status $SERVICE_NAME --no-pager
```

## 说明

- `set -e`：任何命令失败立即退出
- 适用于 PM2 / systemd 管理的服务
