import Link from "next/link";
import {
  MIN_VERIFIED_FOR_STATS,
  getIndustryOverview,
  getRevenueBreakdown,
  type RevenueBreakdown,
} from "@/lib/industryStats";
import { getIndustryName } from "@/lib/industries";

export const metadata = {
  title: "업종별 사장님 현황 | 사장단",
  description: "매출·연차 인증을 마친 사장님들의 업종별 매출 구간과 평균 연차를 익명으로 보여드려요.",
};

// 인증 구간은 "N억 이상"이 하한값이라, 분포에서는 다음 구간 전까지의 범위로 보여준다
const RANGE_LABELS = [
  "1억~3억",
  "3억~5억",
  "5억~10억",
  "10억~30억",
  "30억~50억",
  "50억~100억",
  "100억 이상",
];

function Breakdown({
  breakdown,
  verifiedCount,
}: {
  breakdown: RevenueBreakdown | null;
  verifiedCount: number;
}) {
  if (!breakdown) {
    return (
      <p className="rounded-xl bg-foreground/5 px-4 py-6 text-center text-sm text-foreground/60">
        매출 인증한 사장님이 {MIN_VERIFIED_FOR_STATS}명 이상 모이면 공개돼요
        <br />
        <span className="text-xs text-foreground/40">
          (지금 {verifiedCount}명 · 몇 명뿐일 땐 누구인지 추측될 수 있어서 숨겨둬요)
        </span>
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground/60">
        인증 사장님 {breakdown.verified}명 · 평균 {breakdown.avgYears}년차
      </p>
      <div className="flex flex-col gap-2">
        {breakdown.tiers.map((tier, i) => (
          <div key={tier.label} className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 text-foreground/70">
              {RANGE_LABELS[i]}
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-foreground/5">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${tier.percent}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs text-foreground/60">
              {tier.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function IndustryStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string }>;
}) {
  const { industry } = await searchParams;
  const overview = await getIndustryOverview();
  const selected = overview.find((o) => o.slug === industry);

  const totalMembers = overview.reduce((s, o) => s + o.members, 0);
  const totalCurrent = overview.reduce((s, o) => s + o.currentOwners, 0);
  const totalVerified = overview.reduce((s, o) => s + o.verified, 0);

  const breakdown = await getRevenueBreakdown(selected?.slug);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black">업종별 사장님 현황</h1>
        <p className="text-sm text-foreground/60">
          매출·연차를 인증한 사장님들의 데이터를 개인이 드러나지 않게 모아서 보여드려요.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-foreground/10 p-4">
          <div className="text-2xl font-black">{totalMembers}</div>
          <div className="text-xs text-foreground/50">전체 사장님</div>
        </div>
        <div className="rounded-2xl border border-foreground/10 p-4">
          <div className="text-2xl font-black">
            {totalMembers ? Math.round((totalCurrent / totalMembers) * 100) : 0}%
          </div>
          <div className="text-xs text-foreground/50">현재 운영 중</div>
        </div>
        <div className="rounded-2xl border border-foreground/10 p-4">
          <div className="text-2xl font-black">{totalVerified}</div>
          <div className="text-xs text-foreground/50">매출 인증</div>
        </div>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-foreground/10 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">
            {selected ? `${getIndustryName(selected.slug)} 매출 구간` : "전체 업종 매출 구간"}
          </h2>
          {selected && (
            <Link href="/stats" className="text-xs font-medium text-accent">
              전체 보기
            </Link>
          )}
        </div>
        <Breakdown
          breakdown={breakdown}
          verifiedCount={selected ? selected.verified : totalVerified}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold">업종별 보기</h2>
        <div className="flex flex-col divide-y divide-foreground/10">
          {overview.map((o) => (
            <Link
              key={o.slug}
              href={`/stats?industry=${o.slug}`}
              className={`flex items-center justify-between py-3 text-sm hover:opacity-80 ${
                o.slug === selected?.slug ? "font-bold text-accent" : ""
              }`}
            >
              <span>{o.name}</span>
              <span className="text-xs text-foreground/50">
                사장님 {o.members}명 · 인증 {o.verified}명
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Link
        href="/verify-revenue"
        className="rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        매출 인증하고 우리 업종 통계 채우기
      </Link>
    </div>
  );
}
