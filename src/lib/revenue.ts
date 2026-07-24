export type RevenueTier = "1" | "3" | "5" | "10" | "30" | "50" | "100";

export const REVENUE_TIERS: { value: RevenueTier; label: string }[] = [
  { value: "1", label: "1억 이상" },
  { value: "3", label: "3억 이상" },
  { value: "5", label: "5억 이상" },
  { value: "10", label: "10억 이상" },
  { value: "30", label: "30억 이상" },
  { value: "50", label: "50억 이상" },
  { value: "100", label: "100억 이상" },
];

export const REVENUE_TIER_VALUES = REVENUE_TIERS.map((t) => t.value) as [
  RevenueTier,
  ...RevenueTier[],
];

export function getRevenueTierLabel(tier: string | null): string | null {
  if (!tier) return null;
  return REVENUE_TIERS.find((t) => t.value === tier)?.label ?? null;
}
