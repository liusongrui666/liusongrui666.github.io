/**
 * AI 客户端抽象层
 *
 * 支持用户在前端填入 API Key（保存到 localStorage），后端用 key 调用对应服务。
 * 也支持通过环境变量配置（AI_PROVIDER + *_API_KEY）。
 *
 * 兼容 OpenAI Chat Completions 格式的服务商（DeepSeek / OpenAI / 通义千问 / 自定义）都使用统一实现。
 */

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  messages: AIMessage[];
  context?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface ChatChunk {
  content: string;
  done: boolean;
}

export type ProviderId = "deepseek" | "openai" | "qwen" | "custom" | "stub";

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  defaultBaseUrl: string;
  defaultModel: string;
  /** 申请 API key 的网址 */
  signupUrl: string;
  /** 是否支持自定义 baseURL */
  customBaseUrl?: boolean;
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    defaultBaseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    signupUrl: "https://platform.deepseek.com/",
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    signupUrl: "https://platform.openai.com/",
  },
  qwen: {
    id: "qwen",
    name: "通义千问 (Qwen)",
    defaultBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    defaultModel: "qwen-turbo",
    signupUrl: "https://dashscope.console.aliyun.com/",
  },
  custom: {
    id: "custom",
    name: "自定义 OpenAI 兼容",
    defaultBaseUrl: "",
    defaultModel: "",
    signupUrl: "",
    customBaseUrl: true,
  },
  stub: {
    id: "stub",
    name: "未启用",
    defaultBaseUrl: "",
    defaultModel: "",
    signupUrl: "",
  },
};

const SYSTEM_PROMPT_BASE = `你是一位专业、耐心的技术导师，正在帮助用户学习编程和计算机科学知识。

回答要求：
- 简洁清晰，重点突出
- 使用 Markdown 格式
- 中文回答
- 涉及代码时给出可运行示例
- 当用户没有指定深度时，假设是中级开发者
- 必要时主动给出表格、类比、对比
`;

interface StreamParams {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}

/**
 * 通用 OpenAI 兼容流式调用
 */
async function* openaiCompatibleStream(
  params: StreamParams
): AsyncGenerator<ChatChunk, void, void> {
  const { apiKey, baseUrl, model, messages, temperature = 0.7, maxTokens = 2000 } = params;

  if (!apiKey) {
    yield { content: "[错误] API Key 为空", done: false };
    yield { content: "", done: true };
    return;
  }
  if (!baseUrl) {
    yield { content: "[错误] Base URL 为空", done: false };
    yield { content: "", done: true };
    return;
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature,
        max_tokens: maxTokens,
      }),
    });
  } catch (e) {
    yield { content: `[网络错误] ${(e as Error).message}`, done: false };
    yield { content: "", done: true };
    return;
  }

  if (!res.ok) {
    let errText = await res.text();
    try {
      const j = JSON.parse(errText);
      errText = j.error?.message || j.message || errText;
    } catch {}
    yield { content: `[${res.status}] ${errText || res.statusText}`, done: false };
    yield { content: "", done: true };
    return;
  }

  if (!res.body) {
    yield { content: "[错误] 响应无 body", done: false };
    yield { content: "", done: true };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) yield { content: delta, done: false };
        } catch {
          // ignore
        }
      }
    }
  } catch (e) {
    yield { content: `\n[流中断] ${(e as Error).message}`, done: false };
  }

  yield { content: "", done: true };
}

/**
 * 占位实现：未配置 KEY 时返回引导性提示
 */
async function* stubStream(
  options: ChatOptions
): AsyncGenerator<ChatChunk, void, void> {
  const hasContext = Boolean(options.context);
  const prompt = `[占位响应] AI 讲解功能尚未启用。

启用方式（推荐）：

1. 打开笔记页面的「AI 讲解」按钮 → 右上角「设置」
2. 选择服务商（推荐 DeepSeek，中文好、价格低）
3. 填入 API Key（在 https://platform.deepseek.com/ 申请，新用户免费）
4. 保存后即可开始对话

${
  hasContext
    ? "\n✅ 笔记内容已成功传入后端，配置 Key 后即可基于内容进行讲解。"
    : ""
}`;

  const chars = prompt.split("");
  for (const ch of chars) {
    await new Promise((r) => setTimeout(r, 6));
    yield { content: ch, done: false };
  }
  yield { content: "", done: true };
}

/**
 * 流式调用 AI。返回一个异步迭代器，逐 token 产出。
 */
export async function* streamChat(
  options: ChatOptions & {
    /** 用户在前端填入的 API key（优先于环境变量） */
    userApiKey?: string;
    /** 用户选择的服务商 */
    userProvider?: ProviderId;
    /** 用户自定义的 baseURL（custom provider 用） */
    userBaseUrl?: string;
    /** 用户自定义的 model 名（custom provider 用） */
    userModel?: string;
  }
): AsyncGenerator<ChatChunk, void, void> {
  const { userApiKey, userProvider, userBaseUrl, userModel, ...rest } = options;

  // 优先级：用户 key > 环境变量 key
  const envProvider = (process.env.AI_PROVIDER as ProviderId) || "stub";
  const provider: ProviderId = userApiKey ? userProvider || "deepseek" : envProvider;

  // 解析 API key 和 baseUrl
  let apiKey = userApiKey || "";
  let baseUrl = userBaseUrl || "";
  let model = userModel || "";

  if (!apiKey) {
    // 从环境变量取
    if (provider === "deepseek") apiKey = process.env.DEEPSEEK_API_KEY || "";
    else if (provider === "openai") apiKey = process.env.OPENAI_API_KEY || "";
    else if (provider === "qwen") apiKey = process.env.QWEN_API_KEY || "";
  }

  if (!baseUrl) {
    baseUrl = PROVIDERS[provider]?.defaultBaseUrl || "";
  }
  if (!model) {
    model =
      userModel ||
      options.model ||
      PROVIDERS[provider]?.defaultModel ||
      "";
  }

  // 构造 messages
  const messages: AIMessage[] = [
    {
      role: "system",
      content:
        SYSTEM_PROMPT_BASE +
        (options.context ? `\n\n## 当前笔记内容（已作为上下文传入）\n\n${options.context}` : ""),
    },
    ...options.messages,
  ];

  // stub 模式
  if (!apiKey || provider === "stub") {
    yield* stubStream(options);
    return;
  }

  // OpenAI 兼容协议
  yield* openaiCompatibleStream({
    apiKey,
    baseUrl,
    model,
    messages,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  });
}

export function getAIStatus(): {
  enabled: boolean;
  provider: string;
  model: string;
} {
  const provider = (process.env.AI_PROVIDER as ProviderId) || "stub";
  const hasEnvKey = Boolean(
    process.env.DEEPSEEK_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.QWEN_API_KEY
  );
  return {
    enabled: hasEnvKey,
    provider,
    model: PROVIDERS[provider]?.defaultModel || "",
  };
}
