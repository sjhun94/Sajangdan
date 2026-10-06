import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireUser } from "@/lib/authz";
import { POST_IMAGE_PREFIX, POST_IMAGE_TYPES } from "@/lib/postImages";

// 게시글 사진 업로드 허가 발급 (사진은 브라우저에서 줄여서 올라오므로 5MB면 충분)
export async function POST(request: Request) {
  const { error } = await requireUser();
  if (error) return error;

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(POST_IMAGE_PREFIX)) {
          throw new Error("잘못된 업로드 경로예요.");
        }
        return {
          allowedContentTypes: POST_IMAGE_TYPES,
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "업로드 준비에 실패했어요." },
      { status: 400 }
    );
  }
}
