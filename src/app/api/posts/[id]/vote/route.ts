import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/authz";
import { castVote, getPollForPost } from "@/lib/polls";

const voteSchema = z.object({
  optionId: z.string().uuid(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireUser();
  if (error) return error;

  const { id: postId } = await params;
  const body = await request.json();
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  try {
    await castVote({
      postId,
      optionId: parsed.data.optionId,
      userId: session!.user.id,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "OPTION_NOT_FOUND") {
      return NextResponse.json(
        { error: "선택지를 찾을 수 없어요." },
        { status: 404 }
      );
    }
    throw err;
  }

  const poll = await getPollForPost(postId, session!.user.id);
  return NextResponse.json({ poll });
}
