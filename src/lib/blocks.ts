import { pool } from "@/lib/db";
import { formatOwnerLabel } from "@/lib/anon";

export async function toggleBlock(
  blockerUserId: string,
  blockedUserId: string
): Promise<{ blocked: boolean }> {
  if (blockerUserId === blockedUserId) {
    throw new Error("CANNOT_BLOCK_SELF");
  }

  const inserted = await pool.query<{ id: string }>(
    `insert into blocked_users (id, blocker_user_id, blocked_user_id)
     values (gen_random_uuid(), $1, $2)
     on conflict (blocker_user_id, blocked_user_id) do nothing
     returning id`,
    [blockerUserId, blockedUserId]
  );
  if (inserted.rows.length > 0) {
    return { blocked: true };
  }
  await pool.query(
    `delete from blocked_users where blocker_user_id = $1 and blocked_user_id = $2`,
    [blockerUserId, blockedUserId]
  );
  return { blocked: false };
}

export async function unblockUser(
  blockerUserId: string,
  blockedUserId: string
): Promise<void> {
  await pool.query(
    `delete from blocked_users where blocker_user_id = $1 and blocked_user_id = $2`,
    [blockerUserId, blockedUserId]
  );
}

export async function getBlockedUserIds(
  blockerUserId?: string
): Promise<string[]> {
  if (!blockerUserId) return [];
  const { rows } = await pool.query<{ blocked_user_id: string }>(
    `select blocked_user_id from blocked_users where blocker_user_id = $1`,
    [blockerUserId]
  );
  return rows.map((row) => row.blocked_user_id);
}

export type BlockedUserView = {
  userId: string;
  label: string;
  createdAt: string;
};

export async function listBlockedUsers(
  blockerUserId: string
): Promise<BlockedUserView[]> {
  const { rows } = await pool.query<{
    blocked_user_id: string;
    created_at: string;
    region: string | null;
    industry_slug: string | null;
    owner_status: string;
  }>(
    `select bu.blocked_user_id, bu.created_at,
            u.region, u.industry_slug, u.owner_status
     from blocked_users bu
     join users u on u.id = bu.blocked_user_id
     where bu.blocker_user_id = $1
     order by bu.created_at desc`,
    [blockerUserId]
  );

  return rows.map((row) => ({
    userId: row.blocked_user_id,
    label: formatOwnerLabel({
      region: row.region,
      industry_slug: row.industry_slug,
      owner_status: row.owner_status,
    }),
    createdAt: row.created_at,
  }));
}
