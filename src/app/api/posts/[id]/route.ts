import { NextResponse } from "next/server";
import { getPostById } from "@/lib/posts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) {
    return NextResponse.json(
      { error: "게시글을 찾을 수 없어요." },
      { status: 404 }
    );
  }
  return NextResponse.json({ post });
}
