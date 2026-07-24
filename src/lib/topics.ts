export type Topic = {
  slug: string;
  name: string;
};

export const TOPICS: Topic[] = [
  { slug: "tax-accounting", name: "세무·회계" },
  { slug: "marketing", name: "마케팅·홍보" },
  { slug: "interior-facility", name: "인테리어·시설" },
  { slug: "hr-hiring", name: "채용·인력관리" },
  { slug: "delivery-platform", name: "배달·플랫폼 대응" },
  { slug: "startup-prep", name: "창업·폐업 준비" },
  { slug: "legal-dispute", name: "법률·분쟁" },
];

export function getTopicName(slug: string | null): string | null {
  if (!slug) return null;
  return TOPICS.find((t) => t.slug === slug)?.name ?? null;
}
