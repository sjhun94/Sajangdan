import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listBlockedUsers } from "@/lib/blocks";
import { formatShortDate } from "@/lib/format";
import { UnblockButton } from "@/components/board/unblock-button";

export default async function BlockedUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const blocked = await listBlockedUsers(session.user.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-black">차단한 사용자</h1>

      <div className="flex flex-col divide-y divide-foreground/10">
        {blocked.length === 0 && (
          <p className="py-10 text-center text-sm text-foreground/50">
            차단한 사용자가 없어요.
          </p>
        )}
        {blocked.map((b) => (
          <div
            key={b.userId}
            className="flex items-center justify-between py-4"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{b.label}</span>
              <span className="text-xs text-foreground/40">
                {formatShortDate(b.createdAt)} 차단함
              </span>
            </div>
            <UnblockButton userId={b.userId} />
          </div>
        ))}
      </div>
    </div>
  );
}
