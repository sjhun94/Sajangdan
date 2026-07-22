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

export async function getPostById(id: string): Promise<PostDetail | null> {
  const { rows } = await pool.query<PostDetail>(
    `select id, board_id, title, content, like_count, comment_count, created_at
     from posts
     where id = $1 and deleted_at is null`,
    [id]
  );
  return rows[0] ?? null;
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
