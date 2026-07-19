/**
 * AI 客户端抽象层
 *
 * 当前默认实现为占位符（未配置 API Key 时返回提示）。
 * 启用真实 AI 步骤：
 *   1. 在 Vercel 环境变量中配置 AI_PROVIDER 和对应 KEY
 *      - DEEPSEEK_API_KEY (推荐，国内便宜)
 *      - OPENAI_API_KEY
 *      - QWEN_API_KEY
 *   2. 将下方 PROVIDERS 中对应实现的注释打开
 *   3. 重新部署
 *
 * 设计接口：流式响应（SSE），与 OpenAI Chat Completions 兼容格式
 */

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  messages: AIMessage[];
  /** 上下文（如当前笔记内容） */
  context?: string;
  /** 温度 0-1 */
  temperature?: number;
  /** 最大 token */
  maxTokens?: number;
  /** 模型名 */
  model?: string;
}

export interface ChatChunk {
  content: string;
  done: boolean;
}

const SYSTEM_PROMPT_BASE = `你是一位专业、耐心的技术导师，正在帮助用户学习编程和计算机科学知识。

回答要求：
- 简洁清晰，重点突出
- 使用 Markdown 格式
- 中文回答
- 涉及代码时给出可运行示例
- 当用户没有指定深度时，假设是中级开发者
- 必要时主动给出图表/表格/类比
`;

/**
 * 流式调用 AI。返回一个异步迭代器，逐 token 产出。
 * 默认占位符：未配置 KEY 时直接返回提示。
 */
export async function* streamChat(
  options: ChatOptions
): AsyncGenerator<ChatChunk, void, void> {
  const provider = process.env.AI_PROVIDER || "stub";

  if (provider === "stub" || !isAnyKeyConfigured()) {
    yield* stubStream(options);
    return;
  }

  // === 真实实现（默认注释，按需启用） ===

  // 启用步骤：
  //   1. 在 lib/ai.ts 末尾取消注释对应 provider 的实现
  //   2. 在 Vercel 设置 AI_PROVIDER 和对应的 *_API_KEY
  //   3. 重新部署

  // 下面这段在未启用实现时会因找不到函数而报错，保留为占位提示
  yield {
    content: `[配置提示] 检测到 ${provider} 提供方，但对应实现未启用。请编辑 lib/ai.ts 取消注释相关实现。`,
    done: false,
  };
  yield { content: "", done: true };

  /*
  // DeepSeek 实现
  if (provider === "deepseek" && process.env.DEEPSEEK_API_KEY) {
    yield* deepseekStream(options);
    return;
  }

  // OpenAI 实现
  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    yield* openaiStream(options);
    return;
  }

  // 通义千问实现
  if (provider === "qwen" && process.env.QWEN_API_KEY) {
    yield* qwenStream(options);
    return;
  }

  // 未匹配
  yield* stubStream(options);
  */
}

function isAnyKeyConfigured(): boolean {
  return Boolean(
    process.env.DEEPSEEK_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.QWEN_API_KEY
  );
}

export function getAIStatus(): {
  enabled: boolean;
  provider: string;
  model: string;
} {
  const provider = process.env.AI_PROVIDER || "stub";
  const enabled = isAnyKeyConfigured();
  return {
    enabled: enabled,
    provider,
    model:
      provider === "deepseek"
        ? "deepseek-chat"
        : provider === "openai"
          ? "gpt-4o-mini"
          : provider === "qwen"
            ? "qwen-turbo"
            : "stub",
  };
}

/** 占位实现：返回引导性提示 */
async function* stubStream(
  options: ChatOptions
): AsyncGenerator<ChatChunk, void, void> {
  const hasContext = Boolean(options.context);
  const prompt = `[占位响应] AI 讲解功能尚未启用。

要在 Vercel 部署上启用 AI：

1. 在 Vercel 项目 → Settings → Environment Variables 添加：
   - \`AI_PROVIDER\` = \`deepseek\`
   - \`DEEPSEEK_API_KEY\` = 你的 DeepSeek API Key

2. 然后在 [DeepSeek 开放平台](https://platform.deepseek.com/) 申请 API Key（新用户有免费额度）

3. 重新部署后此功能即可使用

${
  hasContext
    ? "\n✅ 笔记内容已成功传入后端，等待 AI 接入后即可基于内容进行讲解。"
    : ""
}

💡 推荐使用 DeepSeek，中文优秀、价格低（1元/百万 tokens）。`;

  // 模拟流式输出
  const chars = prompt.split("");
  for (const ch of chars) {
    await new Promise((r) => setTimeout(r, 8));
    yield { content: ch, done: false };
  }
  yield { content: "", done: true };
}

// === 真实实现（默认注释） ===

/*
async function* deepseekStream(
  options: ChatOptions
): AsyncGenerator<ChatChunk, void, void> {
  const apiKey = process.env.DEEPSEEK_API_KEY!;
  const messages: AIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT_BASE + (options.context ? `\n\n笔记内容：\n${options.context}` : "") },
    ...options.messages,
  ];

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || "deepseek-chat",
      messages,
      stream: true,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
    }),
  });

  if (!res.ok || !res.body) {
    yield { content: `[DeepSeek API 错误] ${res.status} ${await res.text()}`, done: false };
    yield { content: "", done: true };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") {
        yield { content: "", done: true };
        return;
      }
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield { content: delta, done: false };
      } catch {
        // ignore
      }
    }
  }
  yield { content: "", done: true };
}

async function* openaiStream(
  options: ChatOptions
): AsyncGenerator<ChatChunk, void, void> {
  // 同 deepseek，base URL 改为 https://api.openai.com/v1
  // 留作扩展
}

async function* qwenStream(
  options: ChatOptions
): AsyncGenerator<ChatChunk, void, void> {
  // 阿里云 dashscope API
  // 留作扩展
}
*/
