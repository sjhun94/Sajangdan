import { NextResponse, after } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/authz";
import { pool } from "@/lib/db";
import { createComment } from "@/lib/comments";
import { sendPushToUser } from "@/lib/push";
import { isRateLimited } from "@/lib/rateLimit";
import {
  findSpamReason,
  isDuplicateRecent,
  maskProfanity,
} from "@/lib/contentFilter";

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

  const limited = await isRateLimited({
    table: "comments",
    userId: session!.user.id,
    windowMinutes: 5,
    maxCount: 10,
  });
  if (limited) {
    return NextResponse.json(
      { error: "댓글을 너무 자주 남기고 있어요. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  const { id: postId } = await params;
  const body = await request.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "댓글 내용을 입력해주세요." },
      { status: 400 }
    );
  }

  const post = await pool.query<{ id: string; board_slug: string }>(
    `select p.id, b.slug as board_slug from posts p join boards b on b.id = p.board_id
     where p.id = $1 and p.deleted_at is null`,
    [postId]
  );
  if (!post.rows[0]) {
    return NextResponse.json(
      { error: "게시글을 찾을 수 없어요." },
      { status: 404 }
    );
  }

  const spamReason = findSpamReason(parsed.data.content);
  if (spamReason) {
    return NextResponse.json({ error: spamReason }, { status: 400 });
  }
  const content = maskProfanity(parsed.data.content);
  if (
    await isDuplicateRecent({
      table: "comments",
      userId: session!.user.id,
      content,
    })
  ) {
    return NextResponse.json(
      { error: "방금 남긴 댓글과 같은 내용이에요." },
      { status: 400 }
    );
  }

  try {
    const { id, notified } = await createComment({
      postId,
      userId: session!.user.id,
      content,
      parentCommentId: parsed.data.parentCommentId,
    });

    // 응답을 먼저 보내고, 알림 받을 사람의 기기로 푸시는 그 뒤에 보낸다
    if (notified) {
      after(() =>
        sendPushToUser(notified.recipientId, {
          title:
            notified.type === "reply"
              ? "내 댓글에 답글이 달렸어요"
              : "내 글에 새 댓글이 달렸어요",
          body: content.length > 60 ? `${content.slice(0, 60)}…` : content,
          url: `/board/${post.rows[0].board_slug}/${postId}`,
        })
      );
    }
    return NextResponse.json({ id });
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
