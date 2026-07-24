import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listPendingRevenueVerifications } from "@/lib/revenueVerifications";
import { getRevenueTierLabel } from "@/lib/revenue";

export default async function AdminRevenueVerificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const pending = await listPendingRevenueVerifications();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-black">매출/연차 인증 심사</h1>
      {pending.length === 0 && (
        <p className="py-10 text-center text-sm text-foreground/50">
          대기 중인 신청이 없어요.
        </p>
      )}
      <div className="flex flex-col divide-y divide-foreground/10">
        {pending.map((v) => (
          <Link
            key={v.id}
            href={`/admin/revenue-verifications/${v.id}`}
            className="flex items-center justify-between py-4 hover:opacity-80"
          >
            <div className="flex flex-col">
              <span className="font-medium">{v.user_email}</span>
              <span className="text-xs text-foreground/50">
                {v.years_in_business}년차 · {getRevenueTierLabel(v.revenue_tier)}
              </span>
            </div>
            <span className="text-xs text-foreground/50">
              {new Date(v.submitted_at).toLocaleDateString("ko-KR")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
