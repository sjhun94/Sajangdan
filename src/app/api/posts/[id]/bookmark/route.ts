import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { toggleBookmark } from "@/lib/bookmarks";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const result = await toggleBookmark(id, session!.user.id);
  return NextResponse.json(result);
}
