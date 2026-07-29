import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { withdrawAccount } from "@/lib/account";

export async function POST() {
  const { session, error } = await requireUser();
  if (error) return error;

  await withdrawAccount(session!.user.id);
  return NextResponse.json({ ok: true });
}
