import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { listNotifications } from "@/lib/notifications";

export async function GET(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");

  const { results, total } = await listNotifications({
    userId: session!.user.id,
    page,
  });
  return NextResponse.json({ results, total });
}
