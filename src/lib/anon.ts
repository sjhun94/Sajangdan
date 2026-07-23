import { getIndustryShortName } from "@/lib/industries";

export type OwnerLabelInfo = {
  region: string | null;
  industry_slug: string | null;
  owner_status: string;
};

/**
 * "동작구 카페사장님" / "동작구 카페 예비사장님" 형태의 작성자 표시 라벨.
 * region/industry_slug가 없는 옛 계정은 대체 문구로 표시됨.
 */
export function formatOwnerLabel(info: OwnerLabelInfo): string {
  const region = info.region?.trim() || "동네미상";
  const industryShort = getIndustryShortName(info.industry_slug) ?? "사장";
  return info.owner_status === "prospective"
    ? `${region} ${industryShort} 예비사장님`
    : `${region} ${industryShort}사장님`;
}
