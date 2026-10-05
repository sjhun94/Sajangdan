import { pool } from "@/lib/db";
import { INDUSTRIES } from "@/lib/industries";
import { REVENUE_TIERS } from "@/lib/revenue";

// 이 인원 미만인 업종은 매출 분포를 보여주지 않는다 (몇 명뿐이면 누구인지 추측될 수 있어서)
export const MIN_VERIFIED_FOR_STATS = 5;

// 통계에서 빼는 계정: 탈퇴, 데모용 가짜 계정, 테스트 계정, 관리자
const REAL_MEMBER_WHERE = `
  deleted_at is null
  and role = 'user'
  and industry_slug is not null
  and email not like '%@sajangdan.demo'
  and email not like '%@example.com'
`;

export type IndustryOverview = {
  slug: string;
  name: string;
  members: number;
  currentOwners: number;
  verified: number;
};

export type RevenueBreakdown = {
  verified: number;
  avgYears: number | null;
  tiers: { label: string; count: number; percent: number }[];
};

export async function getIndustryOverview(): Promise<IndustryOverview[]> {
  const { rows } = await pool.query<{
    industry_slug: string;
    members: string;
    current_owners: string;
    verified: string;
  }>(
    `select industry_slug,
            count(*) as members,
            count(*) filter (where owner_status = 'current') as current_owners,
            count(*) filter (where revenue_verification_status = 'approved') as verified
     from users
     where ${REAL_MEMBER_WHERE}
     group by industry_slug`
  );
  const bySlug = new Map(rows.map((r) => [r.industry_slug, r]));
  return INDUSTRIES.map((industry) => {
    const row = bySlug.get(industry.slug);
    return {
      slug: industry.slug,
      name: industry.name,
      members: Number(row?.members ?? 0),
      currentOwners: Number(row?.current_owners ?? 0),
      verified: Number(row?.verified ?? 0),
    };
  }).sort((a, b) => b.members - a.members);
}

// industrySlug가 없으면 전체 업종 합산. 인증 인원이 기준 미만이면 null.
export async function getRevenueBreakdown(
  industrySlug?: string
): Promise<RevenueBreakdown | null> {
  const params: unknown[] = [];
  let where = `${REAL_MEMBER_WHERE} and revenue_verification_status = 'approved' and revenue_tier is not null`;
  if (industrySlug) {
    params.push(industrySlug);
    where += ` and industry_slug = $1`;
  }

  const { rows } = await pool.query<{
    revenue_tier: string;
    count: string;
    avg_years: string | null;
  }>(
    `select revenue_tier, count(*) as count, avg(years_in_business) as avg_years
     from users where ${where}
     group by revenue_tier`,
    params
  );

  const verified = rows.reduce((sum, r) => sum + Number(r.count), 0);
  if (verified < MIN_VERIFIED_FOR_STATS) return null;

  const totalYears = rows.reduce(
    (sum, r) => sum + Number(r.avg_years ?? 0) * Number(r.count),
    0
  );
  const countByTier = new Map(rows.map((r) => [r.revenue_tier, Number(r.count)]));

  return {
    verified,
    avgYears: Math.round((totalYears / verified) * 10) / 10,
    tiers: REVENUE_TIERS.map((tier) => {
      const count = countByTier.get(tier.value) ?? 0;
      return {
        label: tier.label,
        count,
        percent: Math.round((count / verified) * 100),
      };
    }),
  };
}
