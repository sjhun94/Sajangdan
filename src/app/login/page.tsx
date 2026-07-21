import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-bold">로그인</h1>
      <p className="text-sm text-foreground/70">
        로그인 기능은 아직 준비 중이에요. 곧 만나요!
      </p>
      <Link href="/" className="text-sm font-medium text-accent">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
