"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  MessageSquare,
  Trash2,
  Bot,
  User,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AITutorProps {
  noteTitle: string;
  noteContent: string;
  noteCategory: string;
}

const QUICK_PROMPTS = [
  { label: "总结要点", prompt: "请用 3-5 个要点总结这篇笔记的核心内容" },
  { label: "通俗解释", prompt: "请用通俗易懂的语言解释这篇笔记的主要概念" },
  { label: "出几道题", prompt: "基于这篇笔记的内容，给我出 3 道练习题（带答案）" },
  { label: "代码示例", prompt: "如果这篇笔记涉及代码，请给出更详细的代码示例" },
];

const STORAGE_KEY = "ai-tutor-messages";

export default function AITutor({ noteTitle, noteContent, noteCategory }: AITutorProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 检查 AI 状态
  useEffect(() => {
    fetch("/api/ai/chat")
      .then((r) => r.json())
      .then((d) => setAiEnabled(Boolean(d.enabled)))
      .catch(() => setAiEnabled(false));
  }, []);

  // 加载历史
  useEffect(() => {
    try {
      const key = `${STORAGE_KEY}:${noteCategory}:${noteTitle}`;
      const saved = localStorage.getItem(key);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, [noteCategory, noteTitle]);

  // 保存历史
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      const key = `${STORAGE_KEY}:${noteCategory}:${noteTitle}`;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch {}
  }, [messages, noteCategory, noteTitle]);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || streaming) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    // 添加空的助手消息
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: `笔记标题：${noteTitle}\n笔记分类：${noteCategory}\n\n笔记内容：\n${noteContent}`,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`请求失败: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data) as { content: string; done: boolean };
            if (json.content) {
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (!last || last.role !== "assistant") return prev;
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + json.content,
                };
                return updated;
              });
            }
          } catch {
            // ignore
          }
        }
      }
    } catch (e) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && !last.content) {
          return [
            ...prev.slice(0, -1),
            { role: "assistant", content: `❌ 出错了：${(e as Error).message}` },
          ];
        }
        return [
          ...prev,
          { role: "assistant", content: `❌ 出错了：${(e as Error).message}` },
        ];
      });
    } finally {
      setStreaming(false);
    }
  }

  function clearHistory() {
    if (!confirm("清空与这篇笔记的对话历史？")) return;
    setMessages([]);
    try {
      localStorage.removeItem(`${STORAGE_KEY}:${noteCategory}:${noteTitle}`);
    } catch {}
  }

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white text-black font-medium shadow-lg hover:scale-105 transition-transform"
        aria-label="AI 讲解"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm">AI 讲解</span>
      </button>

      {/* 抽屉 */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md h-full bg-card border-l border-border flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-5 h-5 text-white shrink-0" />
                <div className="min-w-0">
                  <h2 className="font-semibold text-white truncate">
                    AI 讲解
                  </h2>
                  <p className="text-xs text-muted-foreground truncate">
                    {noteTitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {messages.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="p-2 rounded text-muted-foreground hover:text-white hover:bg-white/5"
                    aria-label="清空历史"
                    title="清空历史"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded text-muted-foreground hover:text-white hover:bg-white/5"
                  aria-label="关闭"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <Bot className="w-10 h-10 mx-auto mb-3 text-muted" />
                    <p className="mb-1 text-foreground">开始与 AI 一起学习</p>
                    <p className="text-xs">
                      AI 会读取这篇笔记的全部内容作为上下文
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      快捷提问
                    </p>
                    <div className="space-y-2">
                      {QUICK_PROMPTS.map((q) => (
                        <button
                          key={q.label}
                          onClick={() => sendMessage(q.prompt)}
                          disabled={streaming}
                          className="w-full text-left px-3 py-2.5 rounded-lg border border-border bg-background hover:border-border-hover hover:bg-card-hover transition-colors text-sm disabled:opacity-50"
                        >
                          <span className="text-foreground">{q.label}</span>
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {q.prompt}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {!aiEnabled && (
                    <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
                      <p className="text-white font-medium mb-1">AI 未启用</p>
                      <p>
                        当前为占位响应。在 Vercel 项目添加{" "}
                        <code className="px-1 py-0.5 rounded bg-white/10 text-white">
                          DEEPSEEK_API_KEY
                        </code>{" "}
                        环境变量并设置{" "}
                        <code className="px-1 py-0.5 rounded bg-white/10 text-white">
                          AI_PROVIDER=deepseek
                        </code>{" "}
                        即可启用真实 AI 讲解。
                      </p>
                    </div>
                  )}
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-white text-black"
                        : "bg-background border border-border text-foreground"
                    }`}
                  >
                    {m.content || (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        思考中
                      </span>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-black" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-border shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="问点关于这篇笔记的问题..."
                  rows={2}
                  disabled={streaming}
                  className="flex-1 resize-none px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-white/40 disabled:opacity-50 text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || streaming}
                  className="p-2.5 rounded-lg bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                  aria-label="发送"
                >
                  {streaming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                AI 回答仅供参考，可能有误，请以原文为准
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
