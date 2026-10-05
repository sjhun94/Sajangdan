import { ImageResponse } from "next/og";
import { loadKoreanFont } from "@/lib/ogFont";

export const OG_SIZE = { width: 1200, height: 630 };

const NAVY = "#16294D";

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// 카카오톡 등에 링크를 공유했을 때 뜨는 미리보기 카드.
// 앱 아이콘과 같은 톤(남색 배경 + 흰 말풍선)으로 맞춘다.
export async function renderShareCard({
  badges,
  title,
  footnote,
}: {
  badges: string[];
  title: string;
  footnote: string;
}) {
  const shownTitle = truncate(title, 60);
  const brand = "사장단";
  const tagline = "자영업자 전용 익명 커뮤니티";

  const [bold, regular] = await Promise.all([
    loadKoreanFont(`${shownTitle}${brand}`, 800),
    loadKoreanFont(`${badges.join("")}${footnote}${tagline}·`, 400),
  ]);

  const fonts = [
    bold && { name: "NotoSansKR", data: bold, weight: 800 as const },
    regular && { name: "NotoSansKR", data: regular, weight: 400 as const },
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: NAVY,
          padding: "56px 64px",
          fontFamily: "NotoSansKR",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {badges.map((badge) => (
            <div
              key={badge}
              style={{
                display: "flex",
                padding: "8px 20px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                color: "#dbe3f2",
                fontSize: 26,
                fontWeight: 400,
              }}
            >
              {badge}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "white",
              borderRadius: 56,
              padding: "44px 52px",
              color: NAVY,
              fontSize: 54,
              fontWeight: 800,
              lineHeight: 1.3,
              wordBreak: "keep-all",
            }}
          >
            {shownTitle}
          </div>
          <svg
            width="60"
            height="50"
            viewBox="0 0 60 50"
            style={{ marginLeft: 90, marginTop: -1 }}
          >
            <polygon points="0,0 60,0 0,50" fill="white" />
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            color: "white",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 44, fontWeight: 800 }}>{brand}</div>
            <div style={{ fontSize: 24, fontWeight: 400, color: "#c8d0e0" }}>
              {tagline}
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 400, color: "#c8d0e0" }}>
            {footnote}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}
