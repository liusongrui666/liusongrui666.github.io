import { renderMarkdown } from "@/lib/markdown";

interface MarkdownProps {
  content: string;
}

export default async function Markdown({ content }: MarkdownProps) {
  const html = await renderMarkdown(content);

  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
