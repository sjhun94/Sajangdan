import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/authz";
import { pool } from "@/lib/db";
import { resolveReport } from "@/lib/reports";
import { softDeletePost } from "@/lib/posts";
import { softDeleteComment } from "@/lib/comments";

const patchSchema = z.object({
  action: z.enum(["delete_content", "dismiss"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id: reportId } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const { rows } = await pool.query<{
    target_type: "post" | "comment";
    post_id: string;
    comment_id: string | null;
  }>(`select target_type, post_id, comment_id from reports where id = $1`, [
    reportId,
  ]);
  if (!rows[0]) {
    return NextResponse.json(
      { error: "신고를 찾을 수 없어요." },
      { status: 404 }
    );
  }

  if (parsed.data.action === "delete_content") {
    if (rows[0].target_type === "comment" && rows[0].comment_id) {
      await softDeleteComment(rows[0].comment_id);
    } else {
      await softDeletePost(rows[0].post_id);
    }
  }

  await resolveReport({
    reportId,
    adminId: session!.user.id,
    status: parsed.data.action === "delete_content" ? "resolved" : "dismissed",
  });

  return NextResponse.json({ ok: true });
}
