import { pool } from "@/lib/db";

export type PollOption = {
  id: string;
  label: string;
  voteCount: number;
  percentage: number;
  isMyVote: boolean;
};

export type Poll = {
  options: PollOption[];
  totalVotes: number;
  hasVoted: boolean;
};

export async function createPollOptions(
  postId: string,
  labels: string[]
): Promise<void> {
  let sortOrder = 0;
  for (const label of labels) {
    await pool.query(
      `insert into poll_options (id, post_id, label, sort_order)
       values (gen_random_uuid(), $1, $2, $3)`,
      [postId, label, sortOrder]
    );
    sortOrder += 1;
  }
}

export async function getPollForPost(
  postId: string,
  currentUserId?: string
): Promise<Poll | null> {
  const { rows } = await pool.query<{
    id: string;
    label: string;
    vote_count: number;
  }>(
    `select id, label, vote_count from poll_options
     where post_id = $1
     order by sort_order asc`,
    [postId]
  );
  if (rows.length === 0) return null;

  const totalVotes = rows.reduce((sum, r) => sum + r.vote_count, 0);

  let myOptionId: string | null = null;
  if (currentUserId) {
    const { rows: voteRows } = await pool.query<{ option_id: string }>(
      `select option_id from poll_votes where post_id = $1 and user_id = $2`,
      [postId, currentUserId]
    );
    myOptionId = voteRows[0]?.option_id ?? null;
  }

  const options: PollOption[] = rows.map((r) => ({
    id: r.id,
    label: r.label,
    voteCount: r.vote_count,
    percentage: totalVotes === 0 ? 0 : Math.round((r.vote_count / totalVotes) * 100),
    isMyVote: r.id === myOptionId,
  }));

  return { options, totalVotes, hasVoted: myOptionId !== null };
}

export async function castVote({
  postId,
  optionId,
  userId,
}: {
  postId: string;
  optionId: string;
  userId: string;
}): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("begin");

    const optionCheck = await client.query(
      `select id from poll_options where id = $1 and post_id = $2`,
      [optionId, postId]
    );
    if (!optionCheck.rows[0]) {
      throw new Error("OPTION_NOT_FOUND");
    }

    const existing = await client.query<{ option_id: string }>(
      `select option_id from poll_votes where post_id = $1 and user_id = $2`,
      [postId, userId]
    );

    if (existing.rows[0]) {
      const previousOptionId = existing.rows[0].option_id;
      if (previousOptionId === optionId) {
        await client.query("commit");
        return; // 같은 선택지 재투표는 변화 없음
      }
      await client.query(
        `update poll_votes set option_id = $1, created_at = now() where post_id = $2 and user_id = $3`,
        [optionId, postId, userId]
      );
      await client.query(
        `update poll_options set vote_count = greatest(vote_count - 1, 0) where id = $1`,
        [previousOptionId]
      );
      await client.query(
        `update poll_options set vote_count = vote_count + 1 where id = $1`,
        [optionId]
      );
    } else {
      await client.query(
        `insert into poll_votes (id, post_id, option_id, user_id)
         values (gen_random_uuid(), $1, $2, $3)`,
        [postId, optionId, userId]
      );
      await client.query(
        `update poll_options set vote_count = vote_count + 1 where id = $1`,
        [optionId]
      );
    }

    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}
