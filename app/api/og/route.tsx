import { ImageResponse } from "next/og";

export const runtime = "edge";

// 动态生成 OG 图
// 访问 /api/og?title=xxx&subtitle=yyy&type=note|project|snippet|home
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const title =
    searchParams.get("title")?.slice(0, 80) || "刘松睿 · 个人学习网站";
  const subtitle =
    searchParams.get("subtitle")?.slice(0, 100) ||
    "C++ · Linux · 算法 · 数据库";
  const type = (searchParams.get("type") || "home").toLowerCase();
  const author = searchParams.get("author") || "liusr.cc.cd";

  // 类型 → 标签 + 颜色
  const typeMap: Record<string, { label: string; color: string }> = {
    note: { label: "NOTE", color: "#3b82f6" },
    project: { label: "PROJECT", color: "#a855f7" },
    snippet: { label: "SNIPPET", color: "#10b981" },
    resume: { label: "RESUME", color: "#f59e0b" },
    home: { label: "PERSONAL SITE", color: "#ffffff" },
  };
  const badge = typeMap[type] || typeMap.home;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #171717 50%, #0a0a0a 100%)",
          color: "white",
          padding: "60px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 背景网格 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* 顶部类型标签 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "auto",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "6px 14px",
              borderRadius: "6px",
              border: `1px solid ${badge.color}`,
              color: badge.color,
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "2px",
            }}
          >
            {badge.label}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "16px",
              color: "#71717a",
            }}
          >
            liusr.cc.cd
          </div>
        </div>

        {/* 标题 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "40px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "60px",
              fontWeight: 700,
              lineHeight: 1.15,
              color: "#ffffff",
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                display: "flex",
                fontSize: "24px",
                color: "#a1a1aa",
                marginTop: "20px",
                maxWidth: "900px",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* 底部装饰 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "18px",
              color: "#a1a1aa",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "white",
                color: "black",
                fontSize: "20px",
                fontWeight: 700,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              L
            </div>
            <div style={{ display: "flex" }}>{author}</div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "16px",
              color: "#52525b",
              fontFamily: "monospace",
            }}
          >
            https://liusr.cc.cd
          </div>
        </div>

        {/* 装饰：右上角圆点 */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "60px",
            display: "flex",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: badge.color,
            boxShadow: `0 0 20px ${badge.color}`,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
