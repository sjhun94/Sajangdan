"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-foreground/15 px-6 py-3 text-sm font-semibold transition-colors hover:bg-foreground/5"
    >
      로그아웃
    </button>
  );
}
