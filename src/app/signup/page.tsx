import Link from "next/link";
import { Building2, Sparkles } from "lucide-react";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;

  if (type === "owner" || type === "prospective") {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-bold">
          {type === "owner" ? "현재 사장님" : "예비 사장님"}으로 가입
        </h1>
        <p className="text-sm text-foreground/70">
          회원가입 양식은 아직 준비 중이에요. 곧 만나요!
        </p>
        <Link href="/signup" className="text-sm font-medium text-accent">
          다시 선택하기
        </Link>
        <Link href="/" className="text-sm font-medium text-foreground/50">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          어떤 사장님이신가요?
        </h1>
        <p className="text-sm text-foreground/60">
          맞는 쪽을 골라주시면 딱 맞는 이야기를 보여드릴게요.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/signup?type=owner"
          className="group flex flex-col items-center gap-4 rounded-3xl border-2 border-foreground/10 p-10 text-center transition-colors hover:border-accent"
        >
          <Building2
            className="h-10 w-10 text-accent"
            strokeWidth={1.5}
          />
          <span className="text-2xl font-bold">현재 사장님</span>
          <span className="text-sm leading-6 text-foreground/60">
            이미 사업을 운영하고 있어요.
            <br />
            사업자등록증으로 인증하고 사장단 게시판을 이용해요.
          </span>
        </Link>
        <Link
          href="/signup?type=prospective"
          className="group flex flex-col items-center gap-4 rounded-3xl border-2 border-foreground/10 p-10 text-center transition-colors hover:border-accent"
        >
          <Sparkles className="h-10 w-10 text-accent" strokeWidth={1.5} />
          <span className="text-2xl font-bold">예비 사장님</span>
          <span className="text-sm leading-6 text-foreground/60">
            창업을 준비하고 있어요.
            <br />
            먼저 자유게시판에서 선배 사장님들 이야기를 둘러봐요.
          </span>
        </Link>
      </div>
    </div>
  );
}
