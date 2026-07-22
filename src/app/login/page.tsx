import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-2xl font-bold">로그인</h1>
      <LoginForm />
      <Link href="/signup" className="text-sm font-medium text-accent">
        계정이 없으신가요? 회원가입
      </Link>
    </div>
  );
}
