import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { markAsRead } from "@/lib/notifications";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  await markAsRead(id, session!.user.id);
  return NextResponse.json({ ok: true });
}
