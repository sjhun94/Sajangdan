import { pool } from "@/lib/db";
import { formatOwnerLabel } from "@/lib/anon";

export type PostSummary = {
  id: string;
  title: string;
  content: string;
  like_count: number;
  comment_count: number;
  industry_slug: string | null;
  author_label: string;
  created_at: string;
};

export type PostDetail = PostSummary & {
  board_id: string;
  user_id: string; // 내부용(글쓴이 식별). 클라이언트 응답에는 절대 그대로 내려주지 않음
  liked_by_me: boolean;
};

type RawPostRow = {
  id: string;
  title: string;
  content: string;
  like_count: number;
  comment_count: number;
  industry_slug: string | null;
  created_at: string;
  author_region: string | null;
  author_industry_slug: string | null;
  author_owner_status: string;
};

function toSummary(row: RawPostRow): PostSummary {
  const { author_region, author_industry_slug, author_owner_status, ...rest } =
    row;
  return {
    ...rest,
    author_label: formatOwnerLabel({
      region: author_region,
      industry_slug: author_industry_slug,
      owner_status: author_owner_status,
    }),
  };
}

const SELECT_POST_WITH_AUTHOR = `
  p.id, p.title, p.content, p.like_count, p.comment_count, p.industry_slug, p.created_at,
  u.region as author_region, u.industry_slug as author_industry_slug,
  u.owner_status as author_owner_status
`;

export async function listPosts({
  boardId,
  query,
  industrySlug,
  page = 1,
  pageSize = 20,
}: {
  boardId: string;
  query?: string;
  industrySlug?: string;
  page?: number;
  pageSize?: number;
}): Promise<PostSummary[]> {
  const offset = (page - 1) * pageSize;
  const params: unknown[] = [boardId];
  let where = "p.board_id = $1 and p.deleted_at is null";

  if (query) {
    params.push(`%${query}%`);
    where += ` and (p.title ilike $${params.length} or p.content ilike $${params.length})`;
  }
  if (industrySlug) {
    params.push(industrySlug);
    where += ` and p.industry_slug = $${params.length}`;
  }

  params.push(pageSize, offset);

  const { rows } = await pool.query<RawPostRow>(
    `select ${SELECT_POST_WITH_AUTHOR}
     from posts p
     join users u on u.id = p.user_id
     where ${where}
     order by p.created_at desc
     limit $${params.length - 1} offset $${params.length}`,
    params
  );
  return rows.map(toSummary);
}

export async function countPosts({
  boardId,
  query,
  industrySlug,
}: {
  boardId: string;
  query?: string;
  industrySlug?: string;
}): Promise<number> {
  const params: unknown[] = [boardId];
  let where = "board_id = $1 and deleted_at is null";

  if (query) {
    params.push(`%${query}%`);
    where += ` and (title ilike $${params.length} or content ilike $${params.length})`;
  }
  if (industrySlug) {
    params.push(industrySlug);
    where += ` and industry_slug = $${params.length}`;
  }

  const { rows } = await pool.query<{ count: string }>(
    `select count(*) from posts where ${where}`,
    params
  );
  return Number(rows[0].count);
}

export type PostSearchResult = PostSummary & {
  board_slug: string;
  board_name: string;
};

export async function searchAllPosts({
  query,
  page = 1,
  pageSize = 20,
}: {
  query: string;
  page?: number;
  pageSize?: number;
}): Promise<{ results: PostSearchResult[]; total: number }> {
  const offset = (page - 1) * pageSize;
  const like = `%${query}%`;

  const { rows: countRows } = await pool.query<{ count: string }>(
    `select count(*) from posts
     where deleted_at is null and (title ilike $1 or content ilike $1)`,
    [like]
  );

  const { rows } = await pool.query<
    RawPostRow & { board_slug: string; board_name: string }
  >(
    `select
       ${SELECT_POST_WITH_AUTHOR},
       b.slug as board_slug, b.name as board_name
     from posts p
     join boards b on b.id = p.board_id
     join users u on u.id = p.user_id
     where p.deleted_at is null and (p.title ilike $1 or p.content ilike $1)
     order by p.created_at desc
     limit $2 offset $3`,
    [like, pageSize, offset]
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

export async function getPostById(
  id: string,
  currentUserId?: string
): Promise<PostDetail | null> {
  const { rows } = await pool.query<RawPostRow & { board_id: string; user_id: string; liked_by_me: boolean }>(
    `select
       ${SELECT_POST_WITH_AUTHOR},
       p.board_id, p.user_id,
       exists(
         select 1 from post_likes pl
         where pl.post_id = p.id and pl.user_id = $2
       ) as liked_by_me
     from posts p
     join users u on u.id = p.user_id
     where p.id = $1 and p.deleted_at is null`,
    [id, currentUserId ?? null]
  );
  const row = rows[0];
  if (!row) return null;

  return {
    ...toSummary(row),
    board_id: row.board_id,
    user_id: row.user_id,
    liked_by_me: row.liked_by_me,
  };
}

export async function togglePostLike(
  postId: string,
  userId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const client = await pool.connect();
  try {
    await client.query("begin");

    const inserted = await client.query<{ id: string }>(
      `insert into post_likes (id, post_id, user_id)
       values (gen_random_uuid(), $1, $2)
       on conflict (post_id, user_id) do nothing
       returning id`,
      [postId, userId]
    );

    let liked: boolean;
    if (inserted.rows.length > 0) {
      await client.query(
        `update posts set like_count = like_count + 1 where id = $1`,
        [postId]
      );
      liked = true;
    } else {
      await client.query(
        `delete from post_likes where post_id = $1 and user_id = $2`,
        [postId, userId]
      );
      await client.query(
        `update posts set like_count = greatest(like_count - 1, 0) where id = $1`,
        [postId]
      );
      liked = false;
    }

    const { rows } = await client.query<{ like_count: number }>(
      `select like_count from posts where id = $1`,
      [postId]
    );

    await client.query("commit");
    return { liked, likeCount: rows[0].like_count };
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

export async function createPost({
  boardId,
  userId,
  title,
  content,
  industrySlug,
}: {
  boardId: string;
  userId: string;
  title: string;
  content: string;
  industrySlug?: string;
}): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `insert into posts (id, board_id, user_id, title, content, industry_slug)
     values (gen_random_uuid(), $1, $2, $3, $4, $5)
     returning id`,
    [boardId, userId, title, content, industrySlug ?? null]
  );
  return rows[0].id;
}
