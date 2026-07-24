import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRevenueVerificationById } from "@/lib/revenueVerifications";
import { getRevenueTierLabel } from "@/lib/revenue";
import { VerificationReviewForm } from "@/components/admin/verification-review-form";

export default async function AdminRevenueVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const { id } = await params;
  const verification = await getRevenueVerificationById(id);
  if (!verification) notFound();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-xl font-bold">{verification.user_email}</h1>
      <p className="text-sm text-foreground/70">
        신청 내용: {verification.years_in_business}년차 ·{" "}
        {getRevenueTierLabel(verification.revenue_tier)}
      </p>
      <p className="text-xs text-foreground/50">
        제출일: {new Date(verification.submitted_at).toLocaleString("ko-KR")}
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/admin/revenue-verifications/${verification.id}/image`}
        alt="매출 증명서"
        className="w-full rounded-2xl border border-foreground/10"
      />

      {verification.status === "pending" ? (
        <VerificationReviewForm
          verificationId={verification.id}
          endpoint="/api/admin/revenue-verifications"
          redirectTo="/admin/revenue-verifications"
        />
      ) : (
        <p className="text-sm text-foreground/60">
          이미 처리된 신청이에요 ({verification.status}).
        </p>
      )}
    </div>
  );
}
