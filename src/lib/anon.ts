import { pool } from "@/lib/db";

/**
 * 글쓴이는 번호를 받지 않고 항상 "글쓴이"로 표시됨.
 * 그 외 참여자는 이 글에서 처음 댓글을 달 때 순번을 받고, 이후로는 같은 번호를 유지함.
 */
export async function assignAnonNumber(
  postId: string,
  userId: string,
  authorId: string
): Promise<number | null> {
  if (userId === authorId) return null;

  const existing = await pool.query<{ anon_number: number }>(
    `select anon_number from post_participants where post_id = $1 and user_id = $2`,
    [postId, userId]
  );
  if (existing.rows[0]) return existing.rows[0].anon_number;

  // posts.next_anon_number 를 원자적으로 증가시켜서 번호 충돌 없이 다음 번호를 받음
  const { rows } = await pool.query<{ assigned: number }>(
    `update posts set next_anon_number = next_anon_number + 1
     where id = $1
     returning next_anon_number - 1 as assigned`,
    [postId]
  );
  const assigned = rows[0].assigned;

  await pool.query(
    `insert into post_participants (id, post_id, user_id, anon_number)
     values (gen_random_uuid(), $1, $2, $3)
     on conflict (post_id, user_id) do nothing`,
    [postId, userId, assigned]
  );

  // 동시 요청으로 다른 번호가 먼저 저장됐을 수 있으니 최종 값을 다시 확인
  const final = await pool.query<{ anon_number: number }>(
    `select anon_number from post_participants where post_id = $1 and user_id = $2`,
    [postId, userId]
  );
  return final.rows[0].anon_number;
}

export function anonLabel(anonNumber: number | null): string {
  return anonNumber === null ? "글쓴이" : `익명${anonNumber}`;
}
