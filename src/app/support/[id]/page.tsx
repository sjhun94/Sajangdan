import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SUPPORT_GROUP_LABELS,
  formatDeadline,
  getSupportProgramById,
  listSimilarPrograms,
} from "@/lib/supportPrograms";
import { SupportProgramList } from "@/components/board/support-program-list";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const program = await getSupportProgramById(id);
  if (!program) return {};

  const title = `${program.title} - 신청기간·지원대상 | 사장단`;
  const description = [
    program.agency && `${program.agency} 공고`,
    program.applyPeriod && `신청기간 ${program.applyPeriod}`,
    program.target && `지원대상 ${program.target}`,
  ]
    .filter(Boolean)
    .join(" · ")
    .concat(". 소상공인·자영업자 지원사업 공고를 사장단에서 확인하세요.");

  return {
    title,
    description,
    alternates: { canonical: `/support/${program.id}` },
    openGraph: { title, description },
    // 마감된 공고는 검색엔진에서 빠지도록
    robots: program.isOpen ? undefined : { index: false, follow: true },
  };
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-3 text-sm">
      <dt className="w-20 shrink-0 text-foreground/50">{label}</dt>
      <dd className="whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

export default async function SupportProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getSupportProgramById(id);
  if (!program) notFound();

  const similar = await listSimilarPrograms(program, 5);
  const group = program.isSmallBiz ? "small-biz" : "others";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <nav className="text-xs text-foreground/50">
        <Link href="/support" className="hover:text-accent">
          지원사업 공고
        </Link>
        {" › "}
        <Link
          href={group === "others" ? "/support?group=others" : "/support"}
          className="hover:text-accent"
        >
          {SUPPORT_GROUP_LABELS[group]}
        </Link>
      </nav>

      <div className="flex flex-col gap-3">
        <span className="flex flex-wrap items-center gap-1">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              program.isOpen
                ? "bg-accent/10 text-accent"
                : "bg-foreground/10 text-foreground/50"
            }`}
          >
            {program.isOpen ? formatDeadline(program.applyEnd) : "마감"}
          </span>
          {program.category && (
            <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-foreground/60">
              {program.category}
            </span>
          )}
        </span>
        <h1 className="text-xl font-bold leading-8">{program.title}</h1>
        {!program.isOpen && (
          <p className="rounded-xl bg-foreground/5 px-4 py-3 text-sm text-foreground/60">
            신청 기간이 끝난 공고예요. 지금 신청할 수 있는 공고는 아래에서 확인해 보세요.
          </p>
        )}
      </div>

      <dl className="flex flex-col divide-y divide-foreground/10 rounded-2xl border border-foreground/10 px-5">
        <InfoRow label="소관기관" value={program.agency} />
        <InfoRow label="지원분야" value={program.category} />
        <InfoRow label="지원대상" value={program.target} />
        <InfoRow label="신청기간" value={program.applyPeriod} />
        <InfoRow label="사업개요" value={program.summary} />
      </dl>

      <a
        href={program.url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        기업마당에서 공고 원문·신청 방법 보기
      </a>

      <div className="flex flex-col gap-2 rounded-2xl border border-foreground/10 p-5">
        <h2 className="font-bold">💬 이 지원사업, 다른 사장님들은?</h2>
        <p className="text-sm text-foreground/60">
          신청해 본 경험이나 궁금한 점을 알짜정보 게시판에서 익명으로 나눠보세요.
        </p>
        <div className="flex gap-2 pt-1">
          <Link
            href="/board/info"
            className="rounded-full border border-foreground/15 px-4 py-2 text-xs font-semibold hover:bg-foreground/5"
          >
            알짜정보 게시판 가기
          </Link>
          <Link
            href="/board/info/new"
            className="rounded-full border border-foreground/15 px-4 py-2 text-xs font-semibold hover:bg-foreground/5"
          >
            질문 글 쓰기
          </Link>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="flex flex-col gap-1">
          <h2 className="font-bold">지금 신청할 수 있는 비슷한 공고</h2>
          <SupportProgramList programs={similar} />
        </div>
      )}

      <p className="text-xs leading-5 text-foreground/40">
        출처: 중소벤처기업부 기업마당(bizinfo.go.kr) 지원사업 공고 · 공공누리 제3유형(출처표시·변경금지).
        공고 내용은 원문 그대로 옮겼으며, 정확한 내용과 신청 방법은 원문에서 확인해 주세요.
      </p>
    </div>
  );
}
