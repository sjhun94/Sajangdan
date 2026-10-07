import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { AppSessionProvider } from "@/components/providers/session-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CapacitorAuthBridge } from "@/components/providers/capacitor-auth-bridge";
import { PushPrompt } from "@/components/push-prompt";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const SITE_DESCRIPTION =
  "우리끼리니까 할 수 있는 말. 사장님들이 익명으로 솔직하게 이야기 나누는 자영업자 전용 커뮤니티.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "사장단 | 자영업자 익명 커뮤니티",
  description: SITE_DESCRIPTION,
  applicationName: "사장단",
  // 새 글 목록(RSS) 위치를 알려준다
  alternates: {
    types: { "application/rss+xml": [{ url: "/rss.xml", title: "사장단 새 글" }] },
  },
  // 아이폰 "홈 화면에 추가" 시 앱처럼 열리도록
  appleWebApp: {
    capable: true,
    title: "사장단",
    statusBarStyle: "default",
  },
  // 구글 서치콘솔·네이버 서치어드바이저 소유 확인 코드 (Vercel 환경변수로 넣는다)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.NAVER_SITE_VERIFICATION
      ? { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION }
      : undefined,
  },
  openGraph: {
    siteName: "사장단",
    locale: "ko_KR",
    type: "website",
    title: "사장단 | 자영업자 익명 커뮤니티",
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1d3b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AppSessionProvider>
          <CapacitorAuthBridge />
          <SiteHeader />
          {children}
          <SiteFooter />
          <PushPrompt />
        </AppSessionProvider>
      </body>
    </html>
  );
}
