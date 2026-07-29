import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/authz";
import { pool } from "@/lib/db";
import { createReport } from "@/lib/reports";
import { isRateLimited } from "@/lib/rateLimit";

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

  const limited = await isRateLimited({
    table: "reports",
    userId: session!.user.id,
    windowMinutes: 60,
    maxCount: 20,
  });
  if (limited) {
    return NextResponse.json(
      { error: "신고를 너무 자주 접수하고 있어요. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  const { id: commentId } = await params;
  const body = await request.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "신고 사유를 선택해주세요." },
      { status: 400 }
    );
  }

  const { rows } = await pool.query<{ post_id: string }>(
    `select post_id from comments where id = $1`,
    [commentId]
  );
  if (!rows[0]) {
    return NextResponse.json(
      { error: "댓글을 찾을 수 없어요." },
      { status: 404 }
    );
  }

  await createReport({
    reporterUserId: session!.user.id,
    targetType: "comment",
    postId: rows[0].post_id,
    commentId,
    reason: parsed.data.reason,
    detail: parsed.data.detail,
  });

  return NextResponse.json({ ok: true });
}
