import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentVerificationStatus } from "@/lib/verifications";
import {
  getCurrentRevenueVerificationStatus,
  getMyLatestRevenueVerification,
} from "@/lib/revenueVerifications";
import { getRevenueTierLabel } from "@/lib/revenue";
import { RevenueUploadForm } from "@/components/verification/revenue-upload-form";

const statusLabel: Record<string, string> = {
  none: "미인증",
  pending: "심사 중",
  approved: "인증 완료",
  rejected: "반려됨",
};

export default async function VerifyRevenuePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.ownerStatus === "prospective") {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-6">
        <h1 className="text-2xl font-bold">매출/연차 인증</h1>
        <p className="text-sm text-foreground/60">
          예비 사장님은 아직 매출/연차 인증 대상이 아니에요. 실제로 사업을
          시작하시면 그때 인증해주세요!
        </p>
      </div>
    );
  }

  const businessStatus = await getCurrentVerificationStatus(session.user.id);
  if (businessStatus !== "approved") {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-6">
        <h1 className="text-2xl font-bold">매출/연차 인증</h1>
        <p className="text-sm text-foreground/60">
          매출/연차 인증은 사업자 인증을 먼저 완료하셔야 신청할 수 있어요.
        </p>
        <Link
          href="/verify-business"
          className="rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          사업자 인증하러 가기
        </Link>
      </div>
    );
  }

  const status = await getCurrentRevenueVerificationStatus(session.user.id);
  const latest = await getMyLatestRevenueVerification(session.user.id);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-bold">매출/연차 인증</h1>
      <p className="text-sm text-foreground/60">
        작년 연매출 구간과 몇 년차인지, 국세청 증명서로 인증하면 이름 옆에
        "(5년차 3억)"처럼 표시돼요.
      </p>

      <div className="rounded-2xl border border-foreground/10 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-foreground/50">현재 상태</span>
          <span className="font-medium">
            {statusLabel[status] ?? status}
          </span>
        </div>
        {status === "approved" && latest && (
          <div className="mt-2 flex justify-between">
            <span className="text-foreground/50">인증된 정보</span>
            <span className="font-medium">
              {latest.years_in_business}년차 ·{" "}
              {getRevenueTierLabel(latest.revenue_tier)}
            </span>
          </div>
        )}
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
        <RevenueUploadForm />
      )}
    </div>
  );
}
