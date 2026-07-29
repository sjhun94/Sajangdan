import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/authz";
import { createReport } from "@/lib/reports";

const reportSchema = z.object({
  reason: z.enum(["spam", "abuse", "fraud", "other"]),
  detail: z.string().trim().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireUser();
  if (error) return error;

  const { id: postId } = await params;
  const body = await request.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "신고 사유를 선택해주세요." },
      { status: 400 }
    );
  }

  await createReport({
    reporterUserId: session!.user.id,
    targetType: "post",
    postId,
    reason: parsed.data.reason,
    detail: parsed.data.detail,
  });

  return NextResponse.json({ ok: true });
}
