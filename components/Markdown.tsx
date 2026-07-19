import { renderMarkdown } from "@/lib/markdown";

interface MarkdownProps {
  content: string;
  currentCategory?: string;
}

export default async function Markdown({ content, currentCategory }: MarkdownProps) {
  const html = await renderMarkdown(content, { currentCategory });

  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
