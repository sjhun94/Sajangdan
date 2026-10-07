import { pool } from "@/lib/db";
import { SITE_URL } from "@/lib/siteUrl";

// 새 글 목록(RSS). 네이버 서치어드바이저 "RSS 제출"에 등록해서 새 글을 빨리 가져가게 한다.
export const revalidate = 1800;

const ITEM_COUNT = 50;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { rows } = await pool.query<{
    id: string;
    slug: string;
    board_name: string;
    title: string;
    content: string;
    created_at: Date;
  }>(
    `select p.id, b.slug, b.name as board_name, p.title, p.content, p.created_at
     from posts p join boards b on b.id = p.board_id
     where p.deleted_at is null
     order by p.created_at desc
     limit $1`,
    [ITEM_COUNT]
  );

  const items = rows
    .map((r) => {
      const url = `${SITE_URL}/board/${r.slug}/${r.id}`;
      const summary = r.content.replace(/\s+/g, " ").trim().slice(0, 200);
      return `    <item>
      <title>${escapeXml(r.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(summary)}</description>
      <category>${escapeXml(r.board_name)}</category>
      <pubDate>${new Date(r.created_at).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const lastBuild = rows[0] ? new Date(rows[0].created_at) : new Date();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>사장단 - 자영업자 익명 커뮤니티 새 글</title>
    <link>${SITE_URL}</link>
    <description>사장님들이 익명으로 솔직하게 이야기 나누는 자영업자 전용 커뮤니티 사장단의 새 글</description>
    <language>ko</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
