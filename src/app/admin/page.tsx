import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getAdminOverview,
  getBoardActivity,
  getDailyActivity,
  getTopPostsThisWeek,
} from "@/lib/adminStats";

export const metadata = { title: "운영 대시보드 | 사장단" };

function Tile({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-foreground/10 p-4">
      <span className="text-xs text-foreground/50">{label}</span>
      <span className="text-2xl font-black">{value.toLocaleString()}</span>
      {sub && <span className="text-xs text-foreground/50">{sub}</span>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const [overview, daily, boards, topPosts] = await Promise.all([
    getAdminOverview(),
    getDailyActivity(14),
    getBoardActivity(),
    getTopPostsThisWeek(5),
  ]);
  const maxDaily = Math.max(1, ...daily.map((d) => d.posts + d.comments));
  const todo = [
    { label: "사업자 인증 심사", count: overview.pending.business, href: "/admin/verifications" },
    { label: "매출/연차 인증 심사", count: overview.pending.revenue, href: "/admin/revenue-verifications" },
    { label: "신고 처리", count: overview.pending.reports, href: "/admin/reports" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black">운영 대시보드</h1>
        <p className="text-xs text-foreground/50">
          데모·테스트·관리자·탈퇴 계정은 빼고 실제 사장님 활동만 셌어요. 날짜는 한국 시간 기준이에요.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold">처리할 일</h2>
        <div className="grid grid-cols-3 gap-2">
          {todo.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col gap-0.5 rounded-2xl border p-4 transition-colors hover:border-accent ${
                t.count > 0 ? "border-accent/40 bg-accent/5" : "border-foreground/10"
              }`}
            >
              <span className="text-xs text-foreground/60">{t.label}</span>
              <span className={`text-2xl font-black ${t.count > 0 ? "text-accent" : ""}`}>
                {t.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold">회원</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Tile label="전체 회원" value={overview.users.total} />
          <Tile label="오늘 가입" value={overview.users.today} />
          <Tile label="최근 7일 가입" value={overview.users.week} />
          <Tile
            label="알림 켠 회원"
            value={overview.users.pushOn}
            sub={
              overview.users.total > 0
                ? `${Math.round((overview.users.pushOn / overview.users.total) * 100)}%`
                : undefined
            }
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold">활동</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Tile label="오늘 글" value={overview.posts.today} />
          <Tile label="최근 7일 글" value={overview.posts.week} />
          <Tile label="오늘 댓글" value={overview.comments.today} />
          <Tile label="최근 7일 댓글" value={overview.comments.week} />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold">최근 14일</h2>
        <div className="flex flex-col gap-1 rounded-2xl border border-foreground/10 p-4">
          {daily.map((d) => (
            <div key={d.date} className="flex items-center gap-2 text-xs">
              <span className="w-10 shrink-0 text-foreground/50">{d.date}</span>
              <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-foreground/5">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${(d.posts / maxDaily) * 100}%` }}
                />
                <div
                  className="h-full bg-accent/40"
                  style={{ width: `${(d.comments / maxDaily) * 100}%` }}
                />
              </div>
              <span className="w-32 shrink-0 text-right text-foreground/60">
                가입 {d.signups} · 글 {d.posts} · 댓글 {d.comments}
              </span>
            </div>
          ))}
          <p className="pt-2 text-[11px] text-foreground/40">
            진한 막대는 글, 연한 막대는 댓글이에요.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold">최근 7일 게시판별</h2>
        <div className="flex flex-col divide-y divide-foreground/10 rounded-2xl border border-foreground/10 px-4">
          {boards.map((b) => (
            <Link
              key={b.slug}
              href={`/board/${b.slug}`}
              className="flex items-center justify-between py-3 text-sm hover:text-accent"
            >
              <span>{b.name}</span>
              <span className="text-xs text-foreground/60">
                글 {b.posts} · 조회 {b.views.toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold">이번 주 많이 본 글</h2>
        <div className="flex flex-col divide-y divide-foreground/10 rounded-2xl border border-foreground/10 px-4">
          {topPosts.length === 0 && (
            <p className="py-6 text-center text-sm text-foreground/50">
              최근 7일 동안 올라온 글이 없어요.
            </p>
          )}
          {topPosts.map((p) => (
            <Link
              key={p.id}
              href={`/board/${p.boardSlug}/${p.id}`}
              className="flex items-center justify-between gap-3 py-3 text-sm hover:text-accent"
            >
              <span className="truncate">{p.title}</span>
              <span className="shrink-0 text-xs text-foreground/60">
                조회 {p.views} · 댓글 {p.comments}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <p className="text-xs text-foreground/40">
        지원사업 공고 마지막 수집: {overview.lastSupportFetch ?? "아직 없음"}
      </p>
    </div>
  );
}
