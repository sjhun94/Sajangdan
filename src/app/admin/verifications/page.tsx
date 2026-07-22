import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listPendingVerifications } from "@/lib/verifications";

export default async function AdminVerificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const pending = await listPendingVerifications();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-black">사업자 인증 심사</h1>
      {pending.length === 0 && (
        <p className="py-10 text-center text-sm text-foreground/50">
          대기 중인 신청이 없어요.
        </p>
      )}
      <div className="flex flex-col divide-y divide-foreground/10">
        {pending.map((v) => (
          <Link
            key={v.id}
            href={`/admin/verifications/${v.id}`}
            className="flex items-center justify-between py-4 hover:opacity-80"
          >
            <span className="font-medium">{v.user_email}</span>
            <span className="text-xs text-foreground/50">
              {new Date(v.submitted_at).toLocaleDateString("ko-KR")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
