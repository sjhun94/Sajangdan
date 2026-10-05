import { pool } from "@/lib/db";

const BIZINFO_API = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do";
const BIZINFO_ORIGIN = "https://www.bizinfo.go.kr";

export type SupportProgram = {
  id: string;
  title: string;
  agency: string | null;
  category: string | null;
  summary: string | null;
  target: string | null;
  applyPeriod: string | null;
  applyEnd: string | null;
  url: string;
};

type RawItem = Record<string, unknown>;

function str(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const s = String(value).trim();
  return s ? s : null;
}

function stripHtml(html: string | null): string | null {
  if (!html) return null;
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

// "20261001 ~ 20261031" / "2026-10-01 ~ 2026-10-31" 에서 마감일을 뽑는다.
// 상시/예산 소진 시 등 날짜가 없으면 null.
export function parseApplyEnd(period: string | null): string | null {
  if (!period) return null;
  const dates = [...period.matchAll(/(\d{4})[.\-]?(\d{2})[.\-]?(\d{2})/g)];
  const last = dates[dates.length - 1];
  if (!last) return null;
  return `${last[1]}-${last[2]}-${last[3]}`;
}

// 기업마당 응답은 문서마다 필드 이름 표기가 조금씩 달라서(JSON/RSS) 둘 다 받아준다.
export function normalizeBizinfoItem(item: RawItem) {
  const externalId = str(item.pblancId) ?? str(item.seq);
  const title = str(item.pblancNm) ?? str(item.title);
  const rawUrl = str(item.pblancUrl) ?? str(item.link);
  if (!externalId || !title || !rawUrl) return null;

  const applyPeriod = str(item.reqstBeginEndDe) ?? str(item.reqstDt);
  return {
    externalId,
    title,
    agency: str(item.jrsdInsttNm) ?? str(item.author),
    category: str(item.pldirSportRealmLclasCodeNm) ?? str(item.lcategory),
    summary: stripHtml(str(item.bsnsSumryCn) ?? str(item.description)),
    target: str(item.trgetNm),
    applyPeriod,
    applyEnd: parseApplyEnd(applyPeriod),
    url: rawUrl.startsWith("http") ? rawUrl : `${BIZINFO_ORIGIN}${rawUrl}`,
    registeredAt: str(item.creatPnttm) ?? str(item.pubDate),
  };
}

export async function fetchBizinfoPrograms(apiKey: string) {
  const url = new URL(BIZINFO_API);
  url.searchParams.set("crtfcKey", apiKey);
  url.searchParams.set("dataType", "json");
  url.searchParams.set("searchCnt", "100");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`기업마당 응답 오류: ${res.status}`);
  const data = await res.json();
  if (data?.reqErr) throw new Error(`기업마당 오류: ${data.reqErr}`);

  const items: RawItem[] = Array.isArray(data?.jsonArray)
    ? data.jsonArray
    : Array.isArray(data?.item)
      ? data.item
      : Array.isArray(data)
        ? data
        : [];
  return items
    .map(normalizeBizinfoItem)
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

export async function saveSupportPrograms(
  programs: Awaited<ReturnType<typeof fetchBizinfoPrograms>>
): Promise<number> {
  let inserted = 0;
  for (const p of programs) {
    const res = await pool.query(
      `insert into support_programs
         (external_id, title, agency, category, summary, target, apply_period, apply_end, url, registered_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       on conflict (external_id) do nothing`,
      [
        p.externalId,
        p.title,
        p.agency,
        p.category,
        p.summary,
        p.target,
        p.applyPeriod,
        p.applyEnd,
        p.url,
        p.registeredAt,
      ]
    );
    inserted += res.rowCount ?? 0;
  }
  return inserted;
}

// 마감이 지나지 않은(또는 마감일이 없는 상시) 공고만, 최근 등록순
export async function listOpenSupportPrograms({
  page = 1,
  pageSize = 20,
}: {
  page?: number;
  pageSize?: number;
} = {}): Promise<{ results: SupportProgram[]; total: number }> {
  const where = `apply_end is null or apply_end >= (now() at time zone 'Asia/Seoul')::date`;
  const { rows: countRows } = await pool.query<{ count: string }>(
    `select count(*) from support_programs where ${where}`
  );
  const { rows } = await pool.query<{
    id: string;
    title: string;
    agency: string | null;
    category: string | null;
    summary: string | null;
    target: string | null;
    apply_period: string | null;
    apply_end: string | null;
    url: string;
  }>(
    `select id, title, agency, category, summary, target, apply_period,
            to_char(apply_end, 'YYYY-MM-DD') as apply_end, url
     from support_programs
     where ${where}
     order by created_at desc, apply_end asc nulls last
     limit $1 offset $2`,
    [pageSize, (page - 1) * pageSize]
  );
  return {
    results: rows.map((r) => ({
      id: r.id,
      title: r.title,
      agency: r.agency,
      category: r.category,
      summary: r.summary,
      target: r.target,
      applyPeriod: r.apply_period,
      applyEnd: r.apply_end,
      url: r.url,
    })),
    total: Number(countRows[0].count),
  };
}

// 마감까지 남은 날짜 표시 (D-3, D-day). 마감일이 없으면 "상시"
export function formatDeadline(applyEnd: string | null): string {
  if (!applyEnd) return "상시";
  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })
  );
  today.setHours(0, 0, 0, 0);
  const end = new Date(`${applyEnd}T00:00:00`);
  const days = Math.round((end.getTime() - today.getTime()) / 86400000);
  return days === 0 ? "D-day" : `D-${days}`;
}
