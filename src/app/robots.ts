import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

// 검색엔진 로봇 안내: 공개 글·게시판은 수집, 개인 화면·관리자·API 는 수집하지 않게
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/post-images/"],
      disallow: [
        "/api/",
        "/admin",
        "/me",
        "/notifications",
        "/bookmarks",
        "/blocked",
        "/login",
        "/signup",
        "/onboarding",
        "/auth",
        "/verify-business",
        "/verify-revenue",
        "/search",
        "/board/*/new",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
