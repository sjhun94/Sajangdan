import Link from "next/link";
import { auth } from "@/auth";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
      <Link href="/" className="text-xl font-black tracking-tight">
        사장단
      </Link>
      <nav className="flex items-center gap-2 text-sm font-medium">
        <Link
          href="/board"
          className="rounded-full px-4 py-2 text-foreground/70 transition-colors hover:text-foreground"
        >
          게시판
        </Link>
        {session?.user ? (
          <Link
            href="/me"
            className="rounded-full px-4 py-2 text-foreground/70 transition-colors hover:text-foreground"
          >
            내 정보
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-foreground/70 transition-colors hover:text-foreground"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-accent px-4 py-2 text-accent-foreground transition-opacity hover:opacity-90"
            >
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
