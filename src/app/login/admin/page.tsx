import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-2xl font-bold">관리자 로그인</h1>
      <LoginForm />
    </div>
  );
}
