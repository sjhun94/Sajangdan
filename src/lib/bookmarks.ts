import { pool } from "@/lib/db";
import {
  toSummary,
  SELECT_POST_WITH_AUTHOR,
  type RawPostRow,
  type PostSearchResult,
} from "@/lib/posts";

export async function toggleBookmark(
  postId: string,
  userId: string
): Promise<{ bookmarked: boolean }> {
  const inserted = await pool.query<{ id: string }>(
    `insert into post_bookmarks (id, post_id, user_id)
     values (gen_random_uuid(), $1, $2)
     on conflict (post_id, user_id) do nothing
     returning id`,
    [postId, userId]
  );

  if (inserted.rows.length > 0) {
    return { bookmarked: true };
  }

  await pool.query(
    `delete from post_bookmarks where post_id = $1 and user_id = $2`,
    [postId, userId]
  );
  return { bookmarked: false };
}

export async function isBookmarked(
  postId: string,
  userId?: string
): Promise<boolean> {
  if (!userId) return false;
  const { rows } = await pool.query(
    `select 1 from post_bookmarks where post_id = $1 and user_id = $2`,
    [postId, userId]
  );
  return rows.length > 0;
}

export async function listMyBookmarks({
  userId,
  excludeUserIds = [],
  page = 1,
  pageSize = 20,
}: {
  userId: string;
  excludeUserIds?: string[];
  page?: number;
  pageSize?: number;
}): Promise<{ results: PostSearchResult[]; total: number }> {
  const offset = (page - 1) * pageSize;

  const { rows: countRows } = await pool.query<{ count: string }>(
    `select count(*) from post_bookmarks pb
     join posts p on p.id = pb.post_id
     where pb.user_id = $1 and p.deleted_at is null
       and p.user_id <> all($2::uuid[])`,
    [userId, excludeUserIds]
  );

  const { rows } = await pool.query<
    RawPostRow & { board_slug: string; board_name: string }
  >(
    `select
       ${SELECT_POST_WITH_AUTHOR},
       b.slug as board_slug, b.name as board_name
     from post_bookmarks pb
     join posts p on p.id = pb.post_id
     join boards b on b.id = p.board_id
     join users u on u.id = p.user_id
     where pb.user_id = $1 and p.deleted_at is null
       and p.user_id <> all($2::uuid[])
     order by pb.created_at desc
     limit $3 offset $4`,
    [userId, excludeUserIds, pageSize, offset]
  );

  return {
    results: rows.map((row) => ({
      ...toSummary(row),
      board_slug: row.board_slug,
      board_name: row.board_name,
    })),
    total: Number(countRows[0].count),
  };
}
