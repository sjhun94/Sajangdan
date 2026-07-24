import { getIndustryShortName } from "@/lib/industries";
import { getRevenueTierLabel } from "@/lib/revenue";

export type OwnerLabelInfo = {
  region: string | null;
  industry_slug: string | null;
  owner_status: string;
  revenue_verification_status?: string;
  revenue_tier?: string | null;
  years_in_business?: number | null;
};

/**
 * "동작구 카페사장님" / "동작구 카페 예비사장님" 형태의 작성자 표시 라벨.
 * 매출 인증까지 완료된 경우 "(5년차 3억) 동작구 카페사장님" 형태로 앞에 붙음.
 * region/industry_slug가 없는 옛 계정은 대체 문구로 표시됨.
 */
export function formatOwnerLabel(info: OwnerLabelInfo): string {
  const region = info.region?.trim() || "동네미상";
  const industryShort = getIndustryShortName(info.industry_slug);
  const isProspective = info.owner_status === "prospective";

  const base = !industryShort
    ? isProspective
      ? `${region} 예비사장님`
      : `${region} 사장님`
    : isProspective
      ? `${region} ${industryShort} 예비사장님`
      : `${region} ${industryShort}사장님`;

  if (
    info.revenue_verification_status === "approved" &&
    info.years_in_business != null &&
    info.revenue_tier
  ) {
    const tierLabel = getRevenueTierLabel(info.revenue_tier);
    if (tierLabel) {
      return `(${info.years_in_business}년차 ${info.revenue_tier}억) ${base}`;
    }
  }

  return base;
}
