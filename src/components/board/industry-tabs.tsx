import Link from "next/link";
import { INDUSTRIES } from "@/lib/industries";

export function IndustryTabs({
  slug,
  active,
  q,
}: {
  slug: string;
  active?: string;
  q?: string;
}) {
  function hrefFor(industry?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (industry) params.set("industry", industry);
    const qs = params.toString();
    return qs ? `/board/${slug}?${qs}` : `/board/${slug}`;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <Link
        href={hrefFor(undefined)}
        className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          !active
            ? "border-accent bg-accent text-accent-foreground"
            : "border-foreground/15 text-foreground/60 hover:border-accent hover:text-accent"
        }`}
      >
        전체
      </Link>
      {INDUSTRIES.map((industry) => (
        <Link
          key={industry.slug}
          href={hrefFor(industry.slug)}
          className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            active === industry.slug
              ? "border-accent bg-accent text-accent-foreground"
              : "border-foreground/15 text-foreground/60 hover:border-accent hover:text-accent"
          }`}
        >
          {industry.name}
        </Link>
      ))}
    </div>
  );
}
