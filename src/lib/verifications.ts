import { pool } from "@/lib/db";

export type VerificationStatus = "none" | "pending" | "approved" | "rejected";

export type VerificationRequest = {
  id: string;
  user_id: string;
  user_email: string;
  blob_url: string;
  original_filename: string | null;
  status: "pending" | "approved" | "rejected";
  reject_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
};

export async function getCurrentVerificationStatus(
  userId: string
): Promise<VerificationStatus> {
  const { rows } = await pool.query<{ business_verification_status: VerificationStatus }>(
    `select business_verification_status from users where id = $1`,
    [userId]
  );
  return rows[0]?.business_verification_status ?? "none";
}

export async function getMyLatestVerification(
  userId: string
): Promise<VerificationRequest | null> {
  const { rows } = await pool.query<VerificationRequest>(
    `select bv.id, bv.user_id, u.email as user_email, bv.blob_url, bv.original_filename,
            bv.status, bv.reject_reason, bv.submitted_at, bv.reviewed_at
     from business_verifications bv
     join users u on u.id = bv.user_id
     where bv.user_id = $1
     order by bv.submitted_at desc
     limit 1`,
    [userId]
  );
  return rows[0] ?? null;
}

export async function submitVerification({
  userId,
  blobUrl,
  originalFilename,
}: {
  userId: string;
  blobUrl: string;
  originalFilename?: string;
}): Promise<{ id: string }> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query<{ id: string }>(
      `insert into business_verifications (id, user_id, blob_url, original_filename, status)
       values (gen_random_uuid(), $1, $2, $3, 'pending')
       returning id`,
      [userId, blobUrl, originalFilename ?? null]
    );
    await client.query(
      `update users set business_verification_status = 'pending' where id = $1`,
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

export async function listPendingVerifications(): Promise<
  VerificationRequest[]
> {
  const { rows } = await pool.query<VerificationRequest>(
    `select bv.id, bv.user_id, u.email as user_email, bv.blob_url, bv.original_filename,
            bv.status, bv.reject_reason, bv.submitted_at, bv.reviewed_at
     from business_verifications bv
     join users u on u.id = bv.user_id
     where bv.status = 'pending'
     order by bv.submitted_at asc`
  );
  return rows;
}

export async function getVerificationById(
  id: string
): Promise<VerificationRequest | null> {
  const { rows } = await pool.query<VerificationRequest>(
    `select bv.id, bv.user_id, u.email as user_email, bv.blob_url, bv.original_filename,
            bv.status, bv.reject_reason, bv.submitted_at, bv.reviewed_at
     from business_verifications bv
     join users u on u.id = bv.user_id
     where bv.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function reviewVerification({
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
  const verification = await getVerificationById(id);
  if (!verification) throw new Error("NOT_FOUND");
  if (verification.status !== "pending") throw new Error("ALREADY_REVIEWED");

  const client = await pool.connect();
  try {
    await client.query("begin");

    const newStatus = action === "approve" ? "approved" : "rejected";
    await client.query(
      `update business_verifications
       set status = $1, reviewer_admin_id = $2, reject_reason = $3, reviewed_at = now()
       where id = $4`,
      [newStatus, adminId, action === "reject" ? reason ?? null : null, id]
    );
    await client.query(
      `update users set business_verification_status = $1 where id = $2`,
      [newStatus, verification.user_id]
    );

    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}
