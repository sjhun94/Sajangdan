import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { markAllAsRead } from "@/lib/notifications";

export async function POST() {
  const { session, error } = await requireUser();
  if (error) return error;

  await markAllAsRead(session!.user.id);
  return NextResponse.json({ ok: true });
}
