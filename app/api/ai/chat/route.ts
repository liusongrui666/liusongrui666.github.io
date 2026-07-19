import { NextResponse } from "next/server";
import { streamChat, getAIStatus } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  context?: string;
  model?: string;
  temperature?: number;
}

/**
 * AI 讲解 API - 流式响应 (Server-Sent Events)
 *
 * Body: { messages, context?, model?, temperature? }
 *
 * 响应：SSE 格式，每个 event 包含 JSON { content, done }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "缺少 messages" }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChat({
            messages: body.messages,
            context: body.context,
            model: body.model,
            temperature: body.temperature,
          })) {
            const data = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        } catch (e) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                content: `\n\n[错误] ${(e as Error).message}`,
                done: false,
              })}\n\n`
            )
          );
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(getAIStatus());
}
