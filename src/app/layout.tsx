import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { AppSessionProvider } from "@/components/providers/session-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CapacitorAuthBridge } from "@/components/providers/capacitor-auth-bridge";
import { PushPrompt } from "@/components/push-prompt";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const SITE_DESCRIPTION =
  "우리끼리니까 할 수 있는 말. 사장님들이 익명으로 솔직하게 이야기 나누는 자영업자 전용 커뮤니티.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://worktalk-one.vercel.app"
  ),
  title: "사장단 | 자영업자 익명 커뮤니티",
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: "사장단",
    locale: "ko_KR",
    type: "website",
    title: "사장단 | 자영업자 익명 커뮤니티",
    description: SITE_DESCRIPTION,
  },
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
