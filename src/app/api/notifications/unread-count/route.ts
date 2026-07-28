import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { countUnread } from "@/lib/notifications";

export async function GET() {
  const { session, error } = await requireUser();
  if (error) return error;

  const count = await countUnread(session!.user.id);
  return NextResponse.json({ count });
}
