import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/authz";
import { reviewVerification } from "@/lib/verifications";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(500).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  try {
    await reviewVerification({
      id,
      adminId: session!.user.id,
      action: parsed.data.action,
      reason: parsed.data.reason,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json(
        { error: "신청 내역을 찾을 수 없어요." },
        { status: 404 }
      );
    }
    if (err instanceof Error && err.message === "ALREADY_REVIEWED") {
      return NextResponse.json(
        { error: "이미 처리된 신청이에요." },
        { status: 409 }
      );
    }
    throw err;
  }
}
