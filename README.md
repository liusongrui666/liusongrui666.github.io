# My_Web

个人网站 - Next.js 14 + Tailwind CSS + TypeScript

## 目录结构

```
.
├── app/                      # 页面（Next.js App Router）
│   ├── page.tsx              # 首页
│   ├── notes/                # 笔记（按分类）
│   ├── projects/             # 项目
│   ├── snippets/             # 代码片段
│   ├── activity/             # 活动追踪 / 打卡
│   ├── roadmap/              # 学习路线图
│   ├── dashboard/            # 数据仪表盘
│   ├── resume/               # 简历
│   ├── about/                # 关于
│   ├── api/                  # 后端路由
│   ├── feed.xml/             # RSS 订阅
│   └── layout.tsx            # 全局布局
├── components/               # React 组件
├── content/                  # 内容（Markdown）
│   ├── notes/                # 笔记 - 按 category 子目录组织
│   ├── projects/             # 项目 - 每个项目一个子目录
│   └── snippets/             # 代码片段
├── data/                     # 静态数据
│   ├── resume.ts             # 简历信息
│   └── activity.json         # 活动打卡
├── lib/                      # 工具库
└── public/                   # 静态资源
```

## 怎么开始

### 1. 改首页

打开 [app/page.tsx](app/page.tsx)，修改顶部 `hero` 变量。

### 2. 写笔记

```bash
mkdir -p content/notes/cpp
```

创建 `content/notes/cpp/my-note.md`：

```markdown
---
title: 我的第一篇笔记
description: 简介
date: 2026-07-19
tags: [标签]
category: cpp
slug: my-note
---

正文从这开始写。
```

### 3. 加项目

创建 `content/projects/my-project/index.md`：

```markdown
---
title: 我的项目
description: 一句话描述
status: active
startDate: 2026-07-01
techStack: [Next.js, TypeScript]
links:
  - { label: "GitHub", url: "https://github.com/xxx", type: "repo" }
---

# 项目正文
```

### 4. 填简历

打开 [data/resume.ts](data/resume.ts)，按模板填写。

### 5. 每日打卡

- 访问 `/activity` 页面用表单
- 或直接编辑 [data/activity.json](data/activity.json)

### 6. 部署

```bash
git add .
git commit -m "更新内容"
git push
```

Vercel 会自动重新部署。

## 常用命令

```bash
npm.cmd run dev      # 本地开发 (http://localhost:3000)
npm.cmd run build    # 生产构建
npm.cmd run start    # 启动生产服务
```

## 环境变量（可选）

部署到 Vercel 时如果需要 AI 讲解功能，配置：

- `OPENAI_API_KEY` - OpenAI/DeepSeek 等的 API Key
- `OPENAI_BASE_URL` - 自定义 API 端点（可选）
- `NEXT_PUBLIC_GISCUS_REPO` / `NEXT_PUBLIC_GISCUS_REPO_ID` - Giscus 评论
- `NEXT_PUBLIC_GISCUS_CATEGORY` / `NEXT_PUBLIC_GISCUS_CATEGORY_ID`

## 路线图模板

打开 [lib/roadmap.ts](lib/roadmap.ts) 定义学习节点和分组。

## RSS

访问 `/feed.xml` 获取 RSS 订阅源。

## 打印简历

访问 `/resume`，点击"打印 / 存为 PDF"按钮。
