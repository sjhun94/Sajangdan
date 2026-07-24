import Link from "next/link";
import { TOPICS } from "@/lib/topics";

export function TopicTabs({
  slug,
  active,
  q,
}: {
  slug: string;
  active?: string;
  q?: string;
}) {
  function hrefFor(topic?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (topic) params.set("topic", topic);
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
      {TOPICS.map((topic) => (
        <Link
          key={topic.slug}
          href={hrefFor(topic.slug)}
          className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            active === topic.slug
              ? "border-accent bg-accent text-accent-foreground"
              : "border-foreground/15 text-foreground/60 hover:border-accent hover:text-accent"
          }`}
        >
          {topic.name}
        </Link>
      ))}
    </div>
  );
}
