import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/authz";
import { pool } from "@/lib/db";
import { createComment } from "@/lib/comments";

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentCommentId: z.string().uuid().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireUser();
  if (error) return error;

  const { id: postId } = await params;
  const body = await request.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "댓글 내용을 입력해주세요." },
      { status: 400 }
    );
  }

  const post = await pool.query<{ user_id: string }>(
    `select user_id from posts where id = $1 and deleted_at is null`,
    [postId]
  );
  if (!post.rows[0]) {
    return NextResponse.json(
      { error: "게시글을 찾을 수 없어요." },
      { status: 404 }
    );
  }

  try {
    const comment = await createComment({
      postId,
      authorId: post.rows[0].user_id,
      userId: session!.user.id,
      content: parsed.data.content,
      parentCommentId: parsed.data.parentCommentId,
    });
    return NextResponse.json(comment);
  } catch (err) {
    if (err instanceof Error && err.message === "NESTED_REPLY_NOT_ALLOWED") {
      return NextResponse.json(
        { error: "답글에는 답글을 달 수 없어요." },
        { status: 400 }
      );
    }
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json(
        { error: "답글을 달 댓글을 찾을 수 없어요." },
        { status: 404 }
      );
    }
    throw err;
  }
}
