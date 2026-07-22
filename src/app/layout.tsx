import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { AppSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "사장단 | 자영업자 익명 커뮤니티",
  description:
    "우리끼리니까 할 수 있는 말. 사장님들이 익명으로 솔직하게 이야기 나누는 자영업자 전용 커뮤니티.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
