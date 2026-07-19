"use client";

import { useEffect, useState } from "react";
import { PROVIDERS, type ProviderId } from "@/lib/ai";
import { X, Key, ExternalLink, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

const STORAGE_KEY = "ai-user-config";

export interface AIUserConfig {
  provider: ProviderId;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

function loadConfig(): AIUserConfig {
  if (typeof window === "undefined") {
    return { provider: "deepseek", apiKey: "" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { provider: "deepseek", apiKey: "" };
    return JSON.parse(raw);
  } catch {
    return { provider: "deepseek", apiKey: "" };
  }
}

function saveConfig(config: AIUserConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function maskKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "•".repeat(key.length);
  return key.slice(0, 4) + "•".repeat(Math.max(key.length - 8, 4)) + key.slice(-4);
}

interface AISettingsProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (config: AIUserConfig) => void;
}

export default function AISettings({ open, onClose, onSaved }: AISettingsProps) {
  const [config, setConfig] = useState<AIUserConfig>({ provider: "deepseek", apiKey: "" });
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (open) {
      setConfig(loadConfig());
      setTestResult(null);
    }
  }, [open]);

  if (!open) return null;

  const providerInfo = PROVIDERS[config.provider];
  const isCustom = config.provider === "custom";

  function handleSave() {
    saveConfig(config);
    onSaved?.(config);
    onClose();
  }

  async function handleTest() {
    if (!config.apiKey) {
      setTestResult({ ok: false, msg: "请先填写 API Key" });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "ping" }],
          userApiKey: config.apiKey,
          userProvider: config.provider,
          userBaseUrl: config.baseUrl,
          userModel: config.model,
          maxTokens: 5,
        }),
      });
      if (!res.ok) {
        setTestResult({ ok: false, msg: `HTTP ${res.status}` });
        return;
      }
      // 读取 SSE 流的前几个字符判断连通
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      const { value } = await reader.read();
      const text = decoder.decode(value);
      reader.cancel();
      if (text.includes("[") || text.includes("error") || !text) {
        // 尝试解析错误
        const match = /\[错误\]\s*(.+)|\[(\d+)\]\s*(.+)/.exec(text);
        setTestResult({
          ok: false,
          msg: match ? match[1] || match[3] || `错误` : "响应异常",
        });
      } else {
        setTestResult({ ok: true, msg: "连接成功！可以开始对话" });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: (e as Error).message });
    } finally {
      setTesting(false);
    }
  }

  function handleClear() {
    if (!confirm("确定要清除已保存的 API Key 吗？")) return;
    setConfig({ provider: "deepseek", apiKey: "" });
    localStorage.removeItem(STORAGE_KEY);
    setTestResult(null);
  }

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">AI 设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-white"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* 服务商选择 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              服务商
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PROVIDERS) as ProviderId[])
                .filter((p) => p !== "stub")
                .map((p) => {
                  const info = PROVIDERS[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setConfig((c) => ({ ...c, provider: p }))}
                      className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
                        config.provider === p
                          ? "border-white bg-white text-black"
                          : "border-border text-muted-foreground hover:border-border-hover hover:text-white"
                      }`}
                    >
                      {info.name}
                    </button>
                  );
                })}
            </div>
            {providerInfo.signupUrl && (
              <a
                href={providerInfo.signupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white mt-2"
              >
                没有 Key？去 {providerInfo.name} 官网申请
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* 自定义 baseURL 和 model */}
          {isCustom && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  value={config.baseUrl || ""}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, baseUrl: e.target.value }))
                  }
                  placeholder="https://api.example.com/v1"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-white/40 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  模型名
                </label>
                <input
                  type="text"
                  value={config.model || ""}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, model: e.target.value }))
                  }
                  placeholder="gpt-4o-mini"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-white/40 text-sm font-mono"
                />
              </div>
            </>
          )}

          {/* 自定义 model（可选，对所有 provider） */}
          {!isCustom && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                模型名{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  （留空使用默认 {providerInfo.defaultModel}）
                </span>
              </label>
              <input
                type="text"
                value={config.model || ""}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, model: e.target.value }))
                }
                placeholder={providerInfo.defaultModel}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-white/40 text-sm font-mono"
              />
            </div>
          )}

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={config.apiKey}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, apiKey: e.target.value }))
                }
                placeholder="sk-..."
                autoComplete="off"
                className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-white/40 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-white"
                aria-label={showKey ? "隐藏" : "显示"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {config.apiKey && !showKey && (
              <p className="text-xs text-muted-foreground mt-1.5 font-mono">
                已输入：{maskKey(config.apiKey)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1.5">
              ⚠️ Key 仅保存在你本地浏览器，不会上传到服务器
            </p>
          </div>

          {/* 测试结果 */}
          {testResult && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                testResult.ok
                  ? "border-green-500/30 bg-green-500/5 text-green-300"
                  : "border-red-500/30 bg-red-500/5 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{testResult.msg}</span>
              </div>
            </div>
          )}

          {/* 操作 */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
            >
              清除保存的 Key
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTest}
                disabled={testing || !config.apiKey}
                className="px-3 py-2 rounded-lg border border-border text-foreground hover:bg-card-hover transition-colors text-sm inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    测试中
                  </>
                ) : (
                  "测试连接"
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={!config.apiKey}
                className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
