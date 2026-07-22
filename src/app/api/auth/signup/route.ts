import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "@/lib/db";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  ownerStatus: z.enum(["current", "prospective"]),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "이메일과 8자 이상의 비밀번호를 입력해주세요." },
      { status: 400 }
    );
  }
  const { email, password, ownerStatus } = parsed.data;

  const existing = await pool.query("select id from users where email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    return NextResponse.json(
      { error: "이미 가입된 이메일이에요." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query(
    `insert into users (id, email, password_hash, owner_status)
     values ($1, $2, $3, $4)`,
    [randomUUID(), email, passwordHash, ownerStatus]
  );

  return NextResponse.json({ ok: true });
}
