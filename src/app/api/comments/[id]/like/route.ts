import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { toggleCommentLike } from "@/lib/comments";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const result = await toggleCommentLike(id, session!.user.id);
  return NextResponse.json(result);
}
