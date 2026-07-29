import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-8 text-xs text-foreground/50">
      <div className="flex gap-4">
        <Link href="/terms" className="hover:text-foreground/70">
          이용약관
        </Link>
        <Link href="/privacy" className="hover:text-foreground/70">
          개인정보처리방침
        </Link>
      </div>
      <span>© 2026 사장단. 모든 이야기는 익명으로 보호됩니다.</span>
    </footer>
  );
}
