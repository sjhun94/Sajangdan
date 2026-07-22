import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 }),
    };
  }
  return { session, error: null };
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return {
      session: null,
      error: NextResponse.json({ error: "관리자만 접근할 수 있어요." }, { status: 403 }),
    };
  }
  return { session, error: null };
}
