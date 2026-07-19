---
title: 个人学习网站
description: 基于 Next.js 14 构建的个人学习笔记与项目展示网站
status: active
featured: true
startDate: 2026-07-01
tags: [Next.js, TypeScript, Tailwind CSS]
techStack:
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - Vercel
  - Markdown
  - GitHub API
links:
  - label: GitHub 仓库
    url: https://github.com/liusongrui666/liusongrui666.github.io
    type: repo
  - label: 在线访问
    url: https://liusr.cc.cd
    type: demo
---

## 项目简介

这是我的个人学习网站，用来记录学习笔记、展示个人项目、托管学习路线。

## 核心功能

- **Markdown 笔记系统**：C++、Linux、算法、数据库四大分类，支持 frontmatter
- **全文搜索**：基于标签、标题、描述的多字段搜索
- **AI 讲解助手**：支持 DeepSeek / OpenAI / 通义千问，可自填 API Key
- **笔记导入**：支持 Markdown 单文件、Notion 导出的 .zip 压缩包
- **学习路线图**：可视化展示 5 大方向、20+ 学习节点
- **双向链接**：使用 `[[slug]]` 语法在笔记之间建立知识网络
- **AI 代码复制**：所有代码块支持一键复制
- **响应式设计**：适配桌面、平板、手机

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 部署 | Vercel |
| 内容 | Markdown + GitHub |
| AI | OpenAI 兼容协议 |

## 架构亮点

- **Vercel 部署 + GitHub 集成**：导入笔记时通过 GitHub API 创建 commit，自动触发重新部署
- **客户端 AI Key**：用户在前端自填 API Key，存 localStorage，零后端密钥管理
- **静态生成优先**：38 个静态页面 + 3 个动态 API，CDN 友好
