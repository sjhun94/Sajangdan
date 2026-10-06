import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { getPostImageForServe } from "@/lib/postImages";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 게시글 사진 보여주기. 저장소는 비공개라서 서버가 대신 꺼내서 전달한다.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "찾을 수 없어요." }, { status: 404 });
  }

  const image = await getPostImageForServe(id);
  if (!image) {
    return NextResponse.json({ error: "찾을 수 없어요." }, { status: 404 });
  }

  let result;
  try {
    result = await get(image.blobUrl, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch {
    result = null;
  }
  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ error: "찾을 수 없어요." }, { status: 404 });
  }

  // 글이 지워지면 바로 안 보이도록 브라우저 캐시는 짧게(1시간) 둔다
  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
