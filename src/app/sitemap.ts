import type { MetadataRoute } from "next";
import { pool } from "@/lib/db";
import { listBoards } from "@/lib/boards";
import { SITE_URL } from "@/lib/siteUrl";

// 검색엔진에 알려줄 페이지 목록. 글이 계속 늘어나므로 1시간마다 새로 만든다.
export const revalidate = 3600;

const MAX_POSTS = 5000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [boards, { rows: posts }] = await Promise.all([
    listBoards(),
    pool.query<{ id: string; slug: string; created_at: Date }>(
      `select p.id, b.slug, p.created_at
       from posts p join boards b on b.id = p.board_id
       where p.deleted_at is null
       order by p.created_at desc
       limit $1`,
      [MAX_POSTS]
    ),
  ]);

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/board`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/hot`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/support`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/stats`, changeFrequency: "weekly", priority: 0.5 },
    ...boards.map((b) => ({
      url: `${SITE_URL}/board/${b.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/board/${p.slug}/${p.id}`,
      lastModified: p.created_at,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
