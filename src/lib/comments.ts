import { pool } from "@/lib/db";
import { assignAnonNumber, anonLabel } from "@/lib/anon";

export type CommentView = {
  id: string;
  content: string;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
  authorLabel: string;
  isMine: boolean;
  replies: CommentView[];
};

type CommentRow = {
  id: string;
  parent_comment_id: string | null;
  user_id: string;
  content: string;
  like_count: number;
  created_at: string;
  liked_by_me: boolean;
  anon_number: number | null;
};

export async function listComments(
  postId: string,
  authorId: string,
  currentUserId?: string
): Promise<CommentView[]> {
  const { rows } = await pool.query<CommentRow>(
    `select
       c.id, c.parent_comment_id, c.user_id, c.content, c.like_count, c.created_at,
       exists(
         select 1 from comment_likes cl
         where cl.comment_id = c.id and cl.user_id = $2
       ) as liked_by_me,
       pp.anon_number
     from comments c
     left join post_participants pp
       on pp.post_id = c.post_id and pp.user_id = c.user_id
     where c.post_id = $1 and c.deleted_at is null
     order by c.created_at asc`,
    [postId, currentUserId ?? null]
  );

  const toView = (row: CommentRow): CommentView => ({
    id: row.id,
    content: row.content,
    likeCount: row.like_count,
    likedByMe: row.liked_by_me,
    createdAt: row.created_at,
    authorLabel: anonLabel(row.user_id === authorId ? null : row.anon_number),
    isMine: row.user_id === currentUserId,
    replies: [],
  });

  const topLevel: CommentView[] = [];
  const byId = new Map<string, CommentView>();

  for (const row of rows) {
    const view = toView(row);
    byId.set(row.id, view);
    if (!row.parent_comment_id) {
      topLevel.push(view);
    }
  }
  for (const row of rows) {
    if (row.parent_comment_id) {
      const parent = byId.get(row.parent_comment_id);
      const child = byId.get(row.id);
      if (parent && child) parent.replies.push(child);
    }
  }

  return topLevel;
}

export async function createComment({
  postId,
  authorId,
  userId,
  content,
  parentCommentId,
}: {
  postId: string;
  authorId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
}): Promise<{ id: string }> {
  if (parentCommentId) {
    const parent = await pool.query<{ parent_comment_id: string | null }>(
      `select parent_comment_id from comments where id = $1 and post_id = $2`,
      [parentCommentId, postId]
    );
    if (!parent.rows[0]) {
      throw new Error("NOT_FOUND");
    }
    if (parent.rows[0].parent_comment_id) {
      throw new Error("NESTED_REPLY_NOT_ALLOWED");
    }
  }

  await assignAnonNumber(postId, userId, authorId);

  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query<{ id: string }>(
      `insert into comments (id, post_id, user_id, parent_comment_id, content)
       values (gen_random_uuid(), $1, $2, $3, $4)
       returning id`,
      [postId, userId, parentCommentId ?? null, content]
    );
    await client.query(
      `update posts set comment_count = comment_count + 1 where id = $1`,
      [postId]
    );
    await client.query("commit");
    return { id: rows[0].id };
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

export async function toggleCommentLike(
  commentId: string,
  userId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const client = await pool.connect();
  try {
    await client.query("begin");

    const inserted = await client.query<{ id: string }>(
      `insert into comment_likes (id, comment_id, user_id)
       values (gen_random_uuid(), $1, $2)
       on conflict (comment_id, user_id) do nothing
       returning id`,
      [commentId, userId]
    );

    let liked: boolean;
    if (inserted.rows.length > 0) {
      await client.query(
        `update comments set like_count = like_count + 1 where id = $1`,
        [commentId]
      );
      liked = true;
    } else {
      await client.query(
        `delete from comment_likes where comment_id = $1 and user_id = $2`,
        [commentId, userId]
      );
      await client.query(
        `update comments set like_count = greatest(like_count - 1, 0) where id = $1`,
        [commentId]
      );
      liked = false;
    }

    const { rows } = await client.query<{ like_count: number }>(
      `select like_count from comments where id = $1`,
      [commentId]
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
