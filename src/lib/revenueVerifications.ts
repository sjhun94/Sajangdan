import { pool } from "@/lib/db";

export type VerificationStatus = "none" | "pending" | "approved" | "rejected";

export type RevenueVerificationRequest = {
  id: string;
  user_id: string;
  user_email: string;
  revenue_tier: string;
  years_in_business: number;
  blob_url: string;
  original_filename: string | null;
  status: "pending" | "approved" | "rejected";
  reject_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
};

export async function getCurrentRevenueVerificationStatus(
  userId: string
): Promise<VerificationStatus> {
  const { rows } = await pool.query<{
    revenue_verification_status: VerificationStatus;
  }>(`select revenue_verification_status from users where id = $1`, [userId]);
  return rows[0]?.revenue_verification_status ?? "none";
}

export async function getMyLatestRevenueVerification(
  userId: string
): Promise<RevenueVerificationRequest | null> {
  const { rows } = await pool.query<RevenueVerificationRequest>(
    `select rv.id, rv.user_id, u.email as user_email, rv.revenue_tier,
            rv.years_in_business, rv.blob_url, rv.original_filename,
            rv.status, rv.reject_reason, rv.submitted_at, rv.reviewed_at
     from revenue_verifications rv
     join users u on u.id = rv.user_id
     where rv.user_id = $1
     order by rv.submitted_at desc
     limit 1`,
    [userId]
  );
  return rows[0] ?? null;
}

export async function submitRevenueVerification({
  userId,
  revenueTier,
  yearsInBusiness,
  blobUrl,
  originalFilename,
}: {
  userId: string;
  revenueTier: string;
  yearsInBusiness: number;
  blobUrl: string;
  originalFilename?: string;
}): Promise<{ id: string }> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query<{ id: string }>(
      `insert into revenue_verifications
         (id, user_id, revenue_tier, years_in_business, blob_url, original_filename, status)
       values (gen_random_uuid(), $1, $2, $3, $4, $5, 'pending')
       returning id`,
      [userId, revenueTier, yearsInBusiness, blobUrl, originalFilename ?? null]
    );
    await client.query(
      `update users set revenue_verification_status = 'pending' where id = $1`,
      [userId]
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

export async function listPendingRevenueVerifications(): Promise<
  RevenueVerificationRequest[]
> {
  const { rows } = await pool.query<RevenueVerificationRequest>(
    `select rv.id, rv.user_id, u.email as user_email, rv.revenue_tier,
            rv.years_in_business, rv.blob_url, rv.original_filename,
            rv.status, rv.reject_reason, rv.submitted_at, rv.reviewed_at
     from revenue_verifications rv
     join users u on u.id = rv.user_id
     where rv.status = 'pending'
     order by rv.submitted_at asc`
  );
  return rows;
}

export async function getRevenueVerificationById(
  id: string
): Promise<RevenueVerificationRequest | null> {
  const { rows } = await pool.query<RevenueVerificationRequest>(
    `select rv.id, rv.user_id, u.email as user_email, rv.revenue_tier,
            rv.years_in_business, rv.blob_url, rv.original_filename,
            rv.status, rv.reject_reason, rv.submitted_at, rv.reviewed_at
     from revenue_verifications rv
     join users u on u.id = rv.user_id
     where rv.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function reviewRevenueVerification({
  id,
  adminId,
  action,
  reason,
}: {
  id: string;
  adminId: string;
  action: "approve" | "reject";
  reason?: string;
}): Promise<void> {
  const verification = await getRevenueVerificationById(id);
  if (!verification) throw new Error("NOT_FOUND");
  if (verification.status !== "pending") throw new Error("ALREADY_REVIEWED");

  const client = await pool.connect();
  try {
    await client.query("begin");

    const newStatus = action === "approve" ? "approved" : "rejected";
    await client.query(
      `update revenue_verifications
       set status = $1, reviewer_admin_id = $2, reject_reason = $3, reviewed_at = now()
       where id = $4`,
      [newStatus, adminId, action === "reject" ? reason ?? null : null, id]
    );

    if (action === "approve") {
      await client.query(
        `update users
         set revenue_verification_status = 'approved',
             revenue_tier = $1,
             years_in_business = $2
         where id = $3`,
        [verification.revenue_tier, verification.years_in_business, verification.user_id]
      );
    } else {
      await client.query(
        `update users set revenue_verification_status = 'rejected' where id = $1`,
        [verification.user_id]
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
