import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { unblockUser } from "@/lib/blocks";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { session, error } = await requireUser();
  if (error) return error;

  const { userId } = await params;
  await unblockUser(session!.user.id, userId);
  return NextResponse.json({ ok: true });
}
