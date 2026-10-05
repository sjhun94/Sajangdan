import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/authz";
import { getBoardBySlug } from "@/lib/boards";
import { createPost, listPosts } from "@/lib/posts";
import { createPollOptions } from "@/lib/polls";
import { isRateLimited } from "@/lib/rateLimit";
import {
  findSpamReason,
  isDuplicateRecent,
  maskProfanity,
} from "@/lib/contentFilter";
import { INDUSTRIES } from "@/lib/industries";
import { TOPICS } from "@/lib/topics";

const industrySlugs = INDUSTRIES.map((i) => i.slug) as [string, ...string[]];
const topicSlugs = TOPICS.map((t) => t.slug) as [string, ...string[]];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("board");
  const q = searchParams.get("q") ?? undefined;
  const industry = searchParams.get("industry") ?? undefined;
  const topic = searchParams.get("topic") ?? undefined;
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

  const posts = await listPosts({
    boardId: board.id,
    query: q,
    industrySlug: industry,
    topicSlug: topic,
    page,
  });
  return NextResponse.json({ posts });
}

const createPostSchema = z.object({
  boardSlug: z.string(),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  industrySlug: z.enum(industrySlugs).optional(),
  topicSlug: z.enum(topicSlugs).optional(),
  pollOptions: z.array(z.string().trim().min(1).max(100)).min(2).max(6).optional(),
});

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const limited = await isRateLimited({
    table: "posts",
    userId: session!.user.id,
    windowMinutes: 10,
    maxCount: 5,
  });
  if (limited) {
    return NextResponse.json(
      { error: "글을 너무 자주 올리고 있어요. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

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

  if (board.slug === "industry" && !parsed.data.industrySlug) {
    return NextResponse.json(
      { error: "업종을 선택해주세요." },
      { status: 400 }
    );
  }
  if (board.slug === "topic" && !parsed.data.topicSlug) {
    return NextResponse.json(
      { error: "주제를 선택해주세요." },
      { status: 400 }
    );
  }
  if (board.slug === "poll") {
    if (!parsed.data.pollOptions || parsed.data.pollOptions.length < 2) {
      return NextResponse.json(
        { error: "선택지를 2개 이상 입력해주세요." },
        { status: 400 }
      );
    }
  }

  const pollOptions = parsed.data.pollOptions?.map(maskProfanity);
  const spamReason = findSpamReason(
    [parsed.data.title, parsed.data.content, ...(pollOptions ?? [])].join("\n")
  );
  if (spamReason) {
    return NextResponse.json({ error: spamReason }, { status: 400 });
  }

  const title = maskProfanity(parsed.data.title);
  const content = maskProfanity(parsed.data.content);
  if (
    await isDuplicateRecent({
      table: "posts",
      userId: session!.user.id,
      content,
    })
  ) {
    return NextResponse.json(
      { error: "방금 올린 글과 같은 내용이에요." },
      { status: 400 }
    );
  }

  const id = await createPost({
    boardId: board.id,
    userId: session!.user.id,
    title,
    content,
    industrySlug: parsed.data.industrySlug,
    topicSlug: parsed.data.topicSlug,
  });

  if (board.slug === "poll" && pollOptions) {
    await createPollOptions(id, pollOptions);
  }

  return NextResponse.json({ id });
}
