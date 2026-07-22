import { NextResponse } from "next/server";
import { z } from "zod";
import { get } from "@vercel/blob";
import { requireUser } from "@/lib/authz";
import { submitVerification } from "@/lib/verifications";

const confirmSchema = z.object({
  blobUrl: z.string().url(),
  filename: z.string().optional(),
});

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const body = await request.json();
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  // 클라이언트가 보낸 blobUrl이 실제로 우리 Blob 저장소에 업로드된 파일인지
  // 서버에서 다시 한번 확인 (임의의 URL을 그냥 신뢰하지 않도록)
  let blob;
  try {
    blob = await get(parsed.data.blobUrl, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch {
    blob = null;
  }
  if (!blob) {
    return NextResponse.json(
      { error: "업로드된 파일을 확인할 수 없어요." },
      { status: 400 }
    );
  }

  const result = await submitVerification({
    userId: session!.user.id,
    blobUrl: parsed.data.blobUrl,
    originalFilename: parsed.data.filename,
  });

  return NextResponse.json(result);
}
