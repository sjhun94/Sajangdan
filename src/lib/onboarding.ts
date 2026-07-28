import { pool } from "@/lib/db";

export type OnboardingStatus = {
  onboardingCompleted: boolean;
  ownerStatus: "current" | "prospective";
  region: string | null;
  industrySlug: string | null;
};

export async function getOnboardingStatus(
  userId: string
): Promise<OnboardingStatus | null> {
  const { rows } = await pool.query<{
    onboarding_completed: boolean;
    owner_status: "current" | "prospective";
    region: string | null;
    industry_slug: string | null;
  }>(
    `select onboarding_completed, owner_status, region, industry_slug
     from users where id = $1`,
    [userId]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    onboardingCompleted: row.onboarding_completed,
    ownerStatus: row.owner_status,
    region: row.region,
    industrySlug: row.industry_slug,
  };
}

export async function completeOnboarding({
  userId,
  ownerStatus,
  region,
  industrySlug,
}: {
  userId: string;
  ownerStatus: "current" | "prospective";
  region: string;
  industrySlug: string;
}): Promise<void> {
  await pool.query(
    `update users
     set owner_status = $2, region = $3, industry_slug = $4, onboarding_completed = true
     where id = $1`,
    [userId, ownerStatus, region, industrySlug]
  );
}
