import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { remarkWikiLink } from "./remark-wiki-link";

export interface RenderOptions {
  currentCategory?: string;
}

export async function renderMarkdown(
  content: string,
  options: RenderOptions = {}
): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkWikiLink, { currentCategory: options.currentCategory })
    .use(remarkHtml, { sanitize: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "Link to section",
      },
      content: {
        type: "text",
        value: "#",
      },
    })
    .use(rehypeHighlight, {
      detect: true,
      ignoreMissing: true,
    })
    .process(content);

  return result.toString();
}

export function extractHeadings(
  content: string
): Array<{ level: number; text: string; slug: string }> {
  const lines = content.split("\n");
  const headings: Array<{ level: number; text: string; slug: string }> = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`]/g, "").trim();
      const slug = text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u4e00-\u9fa5-]/g, "");
      headings.push({ level, text, slug });
    }
  }
  return headings;
}
