import Link from "next/link";
import { MessagesSquare, ShieldCheck, Search } from "lucide-react";

const features = [
  {
    icon: MessagesSquare,
    title: "익명 게시판",
    description:
      "상호도, 대표자 이름도 없이 '동작구 카페사장님'처럼 동네와 업종으로만 표시돼요. 어느 동네, 어떤 업종인지는 보이지만 누구인지는 아무도 알 수 없어요.",
  },
  {
    icon: ShieldCheck,
    title: "사업자 인증",
    description:
      "사업자등록증을 올리고 관리자 승인을 받으면 정식 사장단 회원이 돼요. 인증 전에도 자유게시판은 바로 이용할 수 있습니다.",
  },
  {
    icon: Search,
    title: "검색 & 카테고리",
    description:
      "자유게시판, 업종별, 우리동네, 프랜차이즈, 주제별, 알짜정보까지 — 궁금한 주제만 골라 보고, 검색으로 원하는 글을 바로 찾아보세요.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-xl font-black tracking-tight">사장단</span>
        <nav className="flex items-center gap-2 text-sm font-medium">
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
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6">
        <section className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
          <span className="rounded-full border border-foreground/15 px-4 py-1 text-xs font-medium text-foreground/60">
            자영업자 전용 익명 커뮤니티
          </span>
          <h1 className="text-7xl font-black leading-tight tracking-tight sm:text-8xl">
            사장단
          </h1>
          <p className="max-w-md text-base leading-7 text-foreground/70 sm:text-lg">
            우리끼리니까 할 수 있는 말. 사장님들의 솔직한 이야기를 익명으로
            편하게 나눠보세요.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-accent px-8 py-3 text-base font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/board"
              className="rounded-full border border-foreground/15 px-8 py-3 text-base font-semibold text-foreground transition-colors hover:bg-foreground/5"
            >
              둘러보기
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 pb-24 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-2xl border border-foreground/10 p-6"
            >
              <Icon className="h-6 w-6 text-accent" strokeWidth={2} />
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="text-sm leading-6 text-foreground/70">
                {description}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-xs text-foreground/50">
        © 2026 사장단. 모든 이야기는 익명으로 보호됩니다.
      </footer>
    </div>
  );
}
