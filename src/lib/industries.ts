export type Industry = {
  slug: string;
  name: string;
  shortName: string; // "{동네} {shortName}사장님" 라벨에 쓰는 짧은 이름
};

export const INDUSTRIES: Industry[] = [
  { slug: "food", name: "음식, 외식", shortName: "음식점" },
  { slug: "delivery-only", name: "배달전문", shortName: "배달" },
  { slug: "cafe", name: "카페, 제과, 디저트", shortName: "카페" },
  { slug: "pub", name: "호프, 주점, 포차", shortName: "호프집" },
  { slug: "unmanned", name: "무인가게", shortName: "무인가게" },
  { slug: "convenience", name: "편의점", shortName: "편의점" },
  { slug: "beauty", name: "미용, 뷰티, 네일", shortName: "뷰티샵" },
  { slug: "education", name: "학원, 교육", shortName: "학원" },
  { slug: "pet", name: "애견샵, 반려동물", shortName: "펫샵" },
  { slug: "lodging", name: "숙박업, 펜션, 모텔, 에어비앤비", shortName: "숙박업" },
  { slug: "leisure", name: "레저, 오락, 스크린", shortName: "레저업" },
  { slug: "fitness", name: "헬스장, 필라테스 등", shortName: "헬스장" },
  { slug: "startup", name: "스타트업, 1인기업", shortName: "스타트업" },
  { slug: "manufacturing", name: "제조업", shortName: "제조업" },
  { slug: "distribution", name: "유통업", shortName: "유통업" },
  { slug: "online-store", name: "온라인쇼핑몰, 스마트스토어", shortName: "쇼핑몰" },
];

export function getIndustryName(slug: string | null): string | null {
  if (!slug) return null;
  return INDUSTRIES.find((i) => i.slug === slug)?.name ?? null;
}

export function getIndustryShortName(slug: string | null): string | null {
  if (!slug) return null;
  return INDUSTRIES.find((i) => i.slug === slug)?.shortName ?? null;
}
