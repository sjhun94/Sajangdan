export type Industry = {
  slug: string;
  name: string;
};

export const INDUSTRIES: Industry[] = [
  { slug: "food", name: "음식, 외식, 배달" },
  { slug: "cafe", name: "카페, 제과, 디저트" },
  { slug: "pub", name: "호프, 주점, 포차" },
  { slug: "unmanned", name: "무인가게" },
  { slug: "convenience", name: "편의점" },
  { slug: "beauty", name: "미용, 뷰티, 네일" },
  { slug: "education", name: "학원, 교육" },
  { slug: "pet", name: "애견샵, 반려동물" },
  { slug: "lodging", name: "숙박업, 펜션, 모텔, 에어비앤비" },
  { slug: "leisure", name: "레저, 오락, 스크린" },
  { slug: "fitness", name: "헬스장, 필라테스 등" },
  { slug: "startup", name: "스타트업, 1인기업" },
  { slug: "manufacturing", name: "제조업" },
  { slug: "distribution", name: "유통업" },
  { slug: "online-store", name: "온라인쇼핑몰, 스마트스토어" },
];

export function getIndustryName(slug: string | null): string | null {
  if (!slug) return null;
  return INDUSTRIES.find((i) => i.slug === slug)?.name ?? null;
}
