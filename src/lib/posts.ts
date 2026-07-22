import { pool } from "@/lib/db";

export type PostSummary = {
  id: string;
  title: string;
  content: string;
  like_count: number;
  comment_count: number;
  created_at: string;
};

export type PostDetail = PostSummary & {
  board_id: string;
  user_id: string; // 내부용(글쓴이 식별). 클라이언트 응답에는 절대 그대로 내려주지 않음
  liked_by_me: boolean;
};

export async function listPosts({
  boardId,
  query,
  page = 1,
  pageSize = 20,
}: {
  boardId: string;
  query?: string;
  page?: number;
  pageSize?: number;
}): Promise<PostSummary[]> {
  const offset = (page - 1) * pageSize;
  const params: unknown[] = [boardId];
  let where = "board_id = $1 and deleted_at is null";

  if (query) {
    params.push(`%${query}%`);
    where += ` and (title ilike $${params.length} or content ilike $${params.length})`;
  }

  params.push(pageSize, offset);

  const { rows } = await pool.query<PostSummary>(
    `select id, title, content, like_count, comment_count, created_at
     from posts
     where ${where}
     order by created_at desc
     limit $${params.length - 1} offset $${params.length}`,
    params
  );
  return rows;
}

export async function countPosts({
  boardId,
  query,
}: {
  boardId: string;
  query?: string;
}): Promise<number> {
  const params: unknown[] = [boardId];
  let where = "board_id = $1 and deleted_at is null";

  if (query) {
    params.push(`%${query}%`);
    where += ` and (title ilike $${params.length} or content ilike $${params.length})`;
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

  const { rows } = await pool.query<PostSearchResult>(
    `select
       p.id, p.title, p.content, p.like_count, p.comment_count, p.created_at,
       b.slug as board_slug, b.name as board_name
     from posts p
     join boards b on b.id = p.board_id
     where p.deleted_at is null and (p.title ilike $1 or p.content ilike $1)
     order by p.created_at desc
     limit $2 offset $3`,
    [like, pageSize, offset]
  );

  return { results: rows, total: Number(countRows[0].count) };
}

export async function getPostById(
  id: string,
  currentUserId?: string
): Promise<PostDetail | null> {
  const { rows } = await pool.query<PostDetail>(
    `select
       p.id, p.board_id, p.user_id, p.title, p.content,
       p.like_count, p.comment_count, p.created_at,
       exists(
         select 1 from post_likes pl
         where pl.post_id = p.id and pl.user_id = $2
       ) as liked_by_me
     from posts p
     where p.id = $1 and p.deleted_at is null`,
    [id, currentUserId ?? null]
  );
  return rows[0] ?? null;
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
}: {
  boardId: string;
  userId: string;
  title: string;
  content: string;
}): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `insert into posts (id, board_id, user_id, title, content)
     values (gen_random_uuid(), $1, $2, $3, $4)
     returning id`,
    [boardId, userId, title, content]
  );
  return rows[0].id;
}
