import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { requireAdmin } from "@/lib/authz";
import { getVerificationById } from "@/lib/verifications";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const verification = await getVerificationById(id);
  if (!verification) {
    return NextResponse.json({ error: "찾을 수 없어요." }, { status: 404 });
  }

  let result;
  try {
    result = await get(verification.blob_url, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch {
    result = null;
  }
  if (!result || result.statusCode !== 200) {
    return NextResponse.json(
      { error: "이미지를 찾을 수 없어요." },
      { status: 404 }
    );
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
