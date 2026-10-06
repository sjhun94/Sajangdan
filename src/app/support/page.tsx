import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import {
  SUPPORT_GROUP_LABELS,
  listOpenSupportPrograms,
  type SupportProgramGroup,
} from "@/lib/supportPrograms";
import { SIDO_COOKIE, isSido, type Sido } from "@/lib/sido";
import { getOnboardingStatus } from "@/lib/onboarding";
import { getIndustryShortName } from "@/lib/industries";
import { SupportProgramList } from "@/components/board/support-program-list";
import { SidoSelect } from "@/components/board/sido-select";
import { Pagination, getTotalPages } from "@/components/board/pagination";

export const metadata = {
  title: "지원사업 공고 | 사장단",
  description: "소상공인·자영업자가 신청할 수 있는 정부 지원사업 공고를 매일 모아드려요.",
};

const GROUPS: SupportProgramGroup[] = ["small-biz", "others"];

export default async function SupportProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; group?: string; sido?: string }>;
}) {
  const {
    page: pageParam,
    group: groupParam,
    sido: sidoParam,
  } = await searchParams;
  const group: SupportProgramGroup =
    groupParam === "others" ? "others" : "small-biz";
  const page = Math.max(1, Number(pageParam) || 1);

  // 주소에 지역이 있으면 그걸, 없으면 지난번에 고른 지역(쿠키)을 쓴다. "all"은 전체.
  const savedSido = (await cookies()).get(SIDO_COOKIE)?.value;
  const sidoValue = sidoParam ?? savedSido;
  const sido: Sido | undefined = isSido(sidoValue) ? sidoValue : undefined;

  // 로그인했고 업종을 정해둔 사장님께는 업종에 맞는 공고를 먼저 보여준다
  const session = await auth();
  const industrySlug = session?.user?.id
    ? (await getOnboardingStatus(session.user.id))?.industrySlug ?? null
    : null;

  const [{ results, total }, recommended, ...counts] = await Promise.all([
    listOpenSupportPrograms({ group, sido, page }),
    industrySlug && page === 1
      ? listOpenSupportPrograms({ group, sido, industrySlug, pageSize: 5 })
      : Promise.resolve(null),
    ...GROUPS.map((g) =>
      listOpenSupportPrograms({ group: g, sido, pageSize: 1 })
    ),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black">지원사업 공고</h1>
        <p className="text-sm text-foreground/60">
          기업마당에 올라온 정부·지자체 지원사업 중 아직 신청할 수 있는 공고를 매일 아침 모아드려요.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {GROUPS.map((g, i) => (
          <Link
            key={g}
            href={g === "small-biz" ? "/support" : `/support?group=${g}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              group === g
                ? "border-accent bg-accent text-accent-foreground"
                : "border-foreground/15 text-foreground/60 hover:border-accent hover:text-accent"
            }`}
          >
            {SUPPORT_GROUP_LABELS[g]} {counts[i].total}
          </Link>
        ))}
        <SidoSelect
          value={sido ?? null}
          group={group === "others" ? "others" : null}
        />
      </div>

      {recommended && recommended.results.length > 0 && (
        <div className="flex flex-col gap-1 rounded-2xl border border-accent/30 bg-accent/5 p-5">
          <h2 className="font-bold">
            🎯 {getIndustryShortName(industrySlug)} 사장님께 맞는 공고{" "}
            <span className="text-sm font-medium text-foreground/50">
              {recommended.total}
            </span>
          </h2>
          <SupportProgramList programs={recommended.results} />
        </div>
      )}

      {results.length === 0 ? (
        <p className="py-10 text-center text-sm text-foreground/50">
          지금 신청할 수 있는 공고가 없어요. 매일 아침 새로 가져와요.
        </p>
      ) : (
        <SupportProgramList programs={results} />
      )}

      <Pagination
        basePath="/support"
        page={page}
        totalPages={getTotalPages(total)}
        extraParams={{
          group: group === "others" ? "others" : undefined,
          sido: sidoParam,
        }}
      />

      <p className="text-xs text-foreground/40">
        출처: 기업마당(bizinfo.go.kr). 정확한 내용은 공고 원문에서 확인해주세요.
      </p>
    </div>
  );
}
