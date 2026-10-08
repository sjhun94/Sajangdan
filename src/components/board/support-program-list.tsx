import Link from "next/link";
import { formatDeadline, type SupportProgram } from "@/lib/supportPrograms";

export function SupportProgramList({
  programs,
}: {
  programs: SupportProgram[];
}) {
  return (
    <div className="flex flex-col divide-y divide-foreground/10">
      {programs.map((p) => (
        <Link
          key={p.id}
          href={`/support/${p.id}`}
          className="flex flex-col gap-1 py-4 hover:opacity-80"
        >
          <span className="flex flex-wrap items-center gap-1">
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
              {formatDeadline(p.applyEnd)}
            </span>
            {p.target && (
              <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-foreground/60">
                {p.target}
              </span>
            )}
            {p.category && (
              <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-foreground/60">
                {p.category}
              </span>
            )}
          </span>
          <span className="font-medium">{p.title}</span>
          {p.summary && (
            <span className="line-clamp-2 text-sm text-foreground/60">
              {p.summary}
            </span>
          )}
          <span className="text-xs text-foreground/50">
            {[p.agency, p.applyPeriod && `신청 ${p.applyPeriod}`]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </Link>
      ))}
    </div>
  );
}
