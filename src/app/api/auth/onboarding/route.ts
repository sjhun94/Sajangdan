import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/authz";
import { completeOnboarding } from "@/lib/onboarding";
import { INDUSTRIES } from "@/lib/industries";

const industrySlugs = INDUSTRIES.map((i) => i.slug) as [string, ...string[]];

const onboardingSchema = z.object({
  ownerStatus: z.enum(["current", "prospective"]),
  region: z.string().trim().min(1).max(30),
  industrySlug: z.enum(industrySlugs),
});

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "동네, 업종을 모두 입력해주세요." },
      { status: 400 }
    );
  }

  await completeOnboarding({
    userId: session!.user.id,
    ...parsed.data,
  });

  return NextResponse.json({ ok: true });
}
