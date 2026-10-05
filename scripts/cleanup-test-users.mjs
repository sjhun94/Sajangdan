// 테스트용 계정(@example.com)과 그 계정이 만든 데이터를 FK 순서대로 지운다.
// 사용법: node --env-file=.env.local scripts/cleanup-test-users.mjs "filtertest_%"
import { Pool } from "pg";

const prefix = process.argv[2];
if (!prefix) {
  console.error('이메일 앞부분 패턴을 넘겨주세요. 예: "filtertest_%"');
  process.exit(1);
}
const pattern = `${prefix}@example.com`;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const { rows: users } = await pool.query(
  `select id, email from users where email like $1`,
  [pattern]
);
const userIds = users.map((u) => u.id);
console.log("대상 계정:", users.map((u) => u.email));

if (userIds.length > 0) {
  const postIds = (
    await pool.query(`select id from posts where user_id = any($1::uuid[])`, [userIds])
  ).rows.map((r) => r.id);
  const commentIds = (
    await pool.query(
      `select id from comments where user_id = any($1::uuid[]) or post_id = any($2::uuid[])`,
      [userIds, postIds]
    )
  ).rows.map((r) => r.id);

  const q = (sql, params) => pool.query(sql, params).catch((e) => {
    // 아직 만들어지지 않은 테이블은 건너뛴다
    if (e.code !== "42P01") throw e;
  });

  await q(`delete from push_subscriptions where user_id = any($1::uuid[])`, [userIds]);
  await q(`delete from auth_bridge_tokens where user_id = any($1::uuid[])`, [userIds]);
  await q(
    `delete from notifications where user_id = any($1::uuid[]) or post_id = any($2::uuid[]) or comment_id = any($3::uuid[])`,
    [userIds, postIds, commentIds]
  );
  await q(
    `delete from reports where reporter_user_id = any($1::uuid[]) or post_id = any($2::uuid[])`,
    [userIds, postIds]
  );
  await q(
    `delete from blocked_users where blocker_user_id = any($1::uuid[]) or blocked_user_id = any($1::uuid[])`,
    [userIds]
  );
  await q(
    `delete from comment_likes where user_id = any($1::uuid[]) or comment_id = any($2::uuid[])`,
    [userIds, commentIds]
  );
  await q(
    `delete from post_likes where user_id = any($1::uuid[]) or post_id = any($2::uuid[])`,
    [userIds, postIds]
  );
  await q(
    `delete from post_bookmarks where user_id = any($1::uuid[]) or post_id = any($2::uuid[])`,
    [userIds, postIds]
  );
  await q(
    `delete from poll_votes where user_id = any($1::uuid[]) or post_id = any($2::uuid[])`,
    [userIds, postIds]
  );
  await q(`delete from poll_options where post_id = any($1::uuid[])`, [postIds]);
  await q(`delete from business_verifications where user_id = any($1::uuid[])`, [userIds]);
  await q(`delete from revenue_verifications where user_id = any($1::uuid[])`, [userIds]);
  // 답글이 원댓글을 참조하므로 답글부터 지운다
  await q(
    `delete from comments where id = any($1::uuid[]) and parent_comment_id is not null`,
    [commentIds]
  );
  await q(`delete from comments where id = any($1::uuid[])`, [commentIds]);
  await q(`delete from posts where id = any($1::uuid[])`, [postIds]);
  const deleted = await pool.query(
    `delete from users where id = any($1::uuid[]) returning email`,
    [userIds]
  );
  console.log("삭제 완료:", deleted.rows.map((r) => r.email));
}

await pool.end();
