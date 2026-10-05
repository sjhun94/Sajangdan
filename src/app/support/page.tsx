import { listOpenSupportPrograms } from "@/lib/supportPrograms";
import { SupportProgramList } from "@/components/board/support-program-list";
import { Pagination, getTotalPages } from "@/components/board/pagination";

export const metadata = {
  title: "지원사업 공고 | 사장단",
  description: "소상공인·자영업자가 신청할 수 있는 정부 지원사업 공고를 매일 모아드려요.",
};

export default async function SupportProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { results, total } = await listOpenSupportPrograms({ page });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black">지원사업 공고</h1>
        <p className="text-sm text-foreground/60">
          기업마당에 올라온 정부·지자체 지원사업 중 아직 신청할 수 있는 공고를 매일 아침 모아드려요.
        </p>
      </div>

      {results.length === 0 ? (
        <p className="py-10 text-center text-sm text-foreground/50">
          아직 모인 공고가 없어요. 매일 아침 새로 가져와요.
        </p>
      ) : (
        <SupportProgramList programs={results} />
      )}

      <Pagination
        basePath="/support"
        page={page}
        totalPages={getTotalPages(total)}
      />

      <p className="text-xs text-foreground/40">
        출처: 기업마당(bizinfo.go.kr). 정확한 내용은 공고 원문에서 확인해주세요.
      </p>
    </div>
  );
}
