import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { pool } from "@/lib/db";
import { toggleBlock } from "@/lib/blocks";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireUser();
  if (error) return error;

  const { id: commentId } = await params;
  const { rows } = await pool.query<{ user_id: string }>(
    `select user_id from comments where id = $1`,
    [commentId]
  );
  if (!rows[0]) {
    return NextResponse.json(
      { error: "댓글을 찾을 수 없어요." },
      { status: 404 }
    );
  }

  try {
    const result = await toggleBlock(session!.user.id, rows[0].user_id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "CANNOT_BLOCK_SELF") {
      return NextResponse.json(
        { error: "본인은 차단할 수 없어요." },
        { status: 400 }
      );
    }
    throw err;
  }
}
