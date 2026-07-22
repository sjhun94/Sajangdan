import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getCurrentVerificationStatus,
  getMyLatestVerification,
} from "@/lib/verifications";
import { VerificationUploadForm } from "@/components/verification/upload-form";

const statusLabel: Record<string, string> = {
  none: "미인증",
  pending: "심사 중",
  approved: "인증 완료",
  rejected: "반려됨",
};

export default async function VerifyBusinessPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const status = await getCurrentVerificationStatus(session.user.id);
  const latest = await getMyLatestVerification(session.user.id);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-bold">사업자 인증</h1>
      <p className="text-sm text-foreground/60">
        사업자등록증 사본을 올리면 관리자가 확인 후 승인해드려요.
      </p>

      <div className="rounded-2xl border border-foreground/10 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-foreground/50">현재 상태</span>
          <span className="font-medium">
            {statusLabel[status] ?? status}
          </span>
        </div>
        {latest?.status === "rejected" && latest.reject_reason && (
          <p className="mt-2 text-xs text-red-500">
            반려 사유: {latest.reject_reason}
          </p>
        )}
      </div>

      {status === "approved" ? (
        <p className="text-sm text-foreground/60">
          이미 인증이 완료됐어요. 감사합니다!
        </p>
      ) : status === "pending" ? (
        <p className="text-sm text-foreground/60">
          제출하신 서류를 확인하고 있어요. 조금만 기다려주세요.
        </p>
      ) : (
        <VerificationUploadForm />
      )}
    </div>
  );
}
