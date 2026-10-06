import type { MetadataRoute } from "next";

// "홈 화면에 추가" 했을 때 앱처럼 열리게 하는 설정.
// 아이폰은 이렇게 설치해야만 웹 알림을 받을 수 있다.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "사장단 - 자영업자 익명 커뮤니티",
    short_name: "사장단",
    description:
      "우리끼리니까 할 수 있는 말. 사장님들이 익명으로 솔직하게 이야기 나누는 자영업자 전용 커뮤니티.",
    start_url: "/board",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0e1d3b",
    lang: "ko",
    icons: [
      { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
