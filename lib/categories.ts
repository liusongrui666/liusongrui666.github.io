/**
 * 分类元数据 - 客户端安全（不依赖 fs）
 */
export interface CategoryMeta {
  name: string;
  description: string;
  order: number;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  cpp: {
    name: "C++",
    description: "C++ 编程语言学习笔记，包括语法、STL、面向对象等",
    order: 1,
  },
  linux: {
    name: "Linux",
    description: "Linux 系统使用、命令行、Shell 脚本等相关笔记",
    order: 2,
  },
  algorithm: {
    name: "算法",
    description: "数据结构与算法学习，包括 LeetCode 题解",
    order: 3,
  },
  database: {
    name: "数据库",
    description: "MySQL、Redis 等数据库相关知识笔记",
    order: 4,
  },
};

export const CATEGORY_SLUGS = Object.keys(CATEGORY_META).sort(
  (a, b) => CATEGORY_META[a].order - CATEGORY_META[b].order
);
