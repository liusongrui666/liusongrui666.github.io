import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root, Text, Link, Parent } from "mdast";
import { getAllNotes, getNote, type NoteSummary } from "./notes";

interface Options {
  /** 当前笔记的 category，用于解析 [[slug]] 时优先匹配 */
  currentCategory?: string;
}

/**
 * 将 [[slug]] / [[category/slug]] / [[slug|显示文本]] 转换为内部链接
 * 链接不存在时显示为红色虚线（提示未创建）
 */
export const remarkWikiLink: Plugin<[Options], Root> = (options = {}) => {
  const { currentCategory = "" } = options;

  // 构建 slug 索引
  const byFullSlug = new Map<string, NoteSummary>();
  const bySlugOnly = new Map<string, NoteSummary[]>();
  for (const n of getAllNotes()) {
    byFullSlug.set(`${n.category}/${n.slug}`, n);
    const list = bySlugOnly.get(n.slug) || [];
    list.push(n);
    bySlugOnly.set(n.slug, list);
  }

  return (tree) => {
    visit(tree, "text", (node: Text, index, parent: Parent | undefined) => {
      if (!parent || index === undefined || index === null) return;
      const re = /\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g;
      const value = node.value;
      if (!re.test(value)) return;
      re.lastIndex = 0;

      const newChildren: Array<Text | Link> = [];
      let lastIdx = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(value)) !== null) {
        if (m.index > lastIdx) {
          newChildren.push({ type: "text", value: value.slice(lastIdx, m.index) });
        }
        const target = m[1].trim();
        const display = (m[2] || target).trim();
        let category = "";
        let slug = target;
        if (target.includes("/")) {
          const parts = target.split("/").map((s) => s.trim());
          category = parts[0];
          slug = parts[1];
        }

        // 解析链接
        let resolved: NoteSummary | null = byFullSlug.get(`${category}/${slug}`) || null;
        if (!resolved && !category) {
          // 优先匹配同分类，否则第一个匹配的
          const candidates = bySlugOnly.get(slug) || [];
          resolved =
            candidates.find((c) => c.category === currentCategory) ||
            candidates[0] ||
            null;
        }

        const linkNode: Link = {
          type: "link",
          url: resolved
            ? `/notes/${resolved.category}/${resolved.slug}`
            : "#",
          title: resolved
            ? `${resolved.category} / ${resolved.title}`
            : "未创建的笔记",
          data: {
            hProperties: {
              className: resolved
                ? ["wiki-link"]
                : ["wiki-link", "wiki-link-missing"],
            },
          },
          children: [{ type: "text", value: display }],
        };
        newChildren.push(linkNode);
        lastIdx = m.index + m[0].length;
      }
      if (lastIdx < value.length) {
        newChildren.push({ type: "text", value: value.slice(lastIdx) });
      }

      (parent.children as unknown as Array<Text | Link>).splice(
        index,
        1,
        ...newChildren
      );
      return index + newChildren.length;
    });
  };
};

// getNote 的重新导出，方便调用方
export { getNote };
