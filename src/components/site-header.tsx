import Link from "next/link";
import { auth } from "@/auth";
import { countUnread } from "@/lib/notifications";

export async function SiteHeader() {
  const session = await auth();
  const unreadCount = session?.user
    ? await countUnread(session.user.id)
    : 0;

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
        <Link
          href="/hot"
          className="rounded-full px-4 py-2 text-foreground/70 transition-colors hover:text-foreground"
        >
          인기글
        </Link>
        {session?.user ? (
          <>
            <Link
              href="/bookmarks"
              className="rounded-full px-4 py-2 text-foreground/70 transition-colors hover:text-foreground"
            >
              스크랩
            </Link>
            <Link
              href="/notifications"
              className="relative rounded-full px-4 py-2 text-foreground/70 transition-colors hover:text-foreground"
            >
              알림
              {unreadCount > 0 && (
                <span className="absolute right-0 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/me"
              className="rounded-full px-4 py-2 text-foreground/70 transition-colors hover:text-foreground"
            >
              내 정보
            </Link>
          </>
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
