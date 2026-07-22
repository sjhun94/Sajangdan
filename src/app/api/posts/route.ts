import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/authz";
import { getBoardBySlug } from "@/lib/boards";
import { createPost, listPosts } from "@/lib/posts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("board");
  const q = searchParams.get("q") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");

  if (!slug) {
    return NextResponse.json(
      { error: "board 파라미터가 필요해요." },
      { status: 400 }
    );
  }

  const board = await getBoardBySlug(slug);
  if (!board) {
    return NextResponse.json(
      { error: "게시판을 찾을 수 없어요." },
      { status: 404 }
    );
  }

  const posts = await listPosts({ boardId: board.id, query: q, page });
  return NextResponse.json({ posts });
}

const createPostSchema = z.object({
  boardSlug: z.string(),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
});

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const body = await request.json();
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "제목과 내용을 입력해주세요." },
      { status: 400 }
    );
  }

  const board = await getBoardBySlug(parsed.data.boardSlug);
  if (!board) {
    return NextResponse.json(
      { error: "게시판을 찾을 수 없어요." },
      { status: 404 }
    );
  }

  const id = await createPost({
    boardId: board.id,
    userId: session!.user.id,
    title: parsed.data.title,
    content: parsed.data.content,
  });

  return NextResponse.json({ id });
}
