import Link from "next/link";
import { auth } from "@/auth";
import { countUnread } from "@/lib/notifications";

export async function SiteHeader() {
  const session = await auth();
  const unreadCount = session?.user
    ? await countUnread(session.user.id)
    : 0;

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-4 sm:px-6 sm:py-6">
      <Link
        href="/"
        className="shrink-0 whitespace-nowrap text-lg font-black tracking-tight sm:text-xl"
      >
        사장단
      </Link>
      <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto text-xs font-medium sm:gap-2 sm:text-sm">
        <Link
          href="/board"
          className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-foreground/70 transition-colors hover:text-foreground sm:px-4 sm:py-2"
        >
          게시판
        </Link>
        <Link
          href="/hot"
          className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-foreground/70 transition-colors hover:text-foreground sm:px-4 sm:py-2"
        >
          인기글
        </Link>
        {session?.user ? (
          <>
            <Link
              href="/bookmarks"
              className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-foreground/70 transition-colors hover:text-foreground sm:px-4 sm:py-2"
            >
              스크랩
            </Link>
            <Link
              href="/notifications"
              className="relative shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-foreground/70 transition-colors hover:text-foreground sm:px-4 sm:py-2"
            >
              알림
              {unreadCount > 0 && (
                <span className="absolute right-0 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground sm:top-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/me"
              className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-foreground/70 transition-colors hover:text-foreground sm:px-4 sm:py-2"
            >
              내 정보
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-foreground/70 transition-colors hover:text-foreground sm:px-4 sm:py-2"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="shrink-0 whitespace-nowrap rounded-full bg-accent px-2.5 py-1.5 text-accent-foreground transition-opacity hover:opacity-90 sm:px-4 sm:py-2"
            >
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
