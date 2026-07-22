import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";

const ownerStatusLabel: Record<string, string> = {
  current: "현재 사장님",
  prospective: "예비 사장님",
};

const verificationLabel: Record<string, string> = {
  none: "미인증",
  pending: "심사 중",
  approved: "인증 완료",
  rejected: "반려됨",
};

export default async function MePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { email, ownerStatus, businessVerificationStatus, role } =
    session.user;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-bold">내 정보</h1>
      <dl className="flex flex-col gap-2 rounded-2xl border border-foreground/10 p-6 text-sm">
        <div className="flex justify-between">
          <dt className="text-foreground/50">이메일</dt>
          <dd>{email}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground/50">구분</dt>
          <dd>{ownerStatusLabel[ownerStatus] ?? ownerStatus}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground/50">사업자 인증</dt>
          <dd>
            {verificationLabel[businessVerificationStatus] ??
              businessVerificationStatus}
          </dd>
        </div>
        {role === "admin" && (
          <div className="flex justify-between">
            <dt className="text-foreground/50">권한</dt>
            <dd>관리자</dd>
          </div>
        )}
      </dl>
      <SignOutButton />
      <Link href="/" className="text-center text-sm text-foreground/50">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
