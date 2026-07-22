import Link from "next/link";

const PAGE_SIZE = 20;

export function getTotalPages(total: number, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function Pagination({
  basePath,
  page,
  totalPages,
  extraParams,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  extraParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(extraParams ?? {})) {
      if (value) params.set(key, value);
    }
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-4 pt-4 text-sm">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="font-medium text-accent">
          이전
        </Link>
      ) : (
        <span className="text-foreground/30">이전</span>
      )}
      <span className="text-foreground/50">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className="font-medium text-accent">
          다음
        </Link>
      ) : (
        <span className="text-foreground/30">다음</span>
      )}
    </div>
  );
}
