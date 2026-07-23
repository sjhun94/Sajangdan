"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { INDUSTRIES } from "@/lib/industries";

export function SignupForm({
  ownerStatus,
}: {
  ownerStatus: "current" | "prospective";
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("");
  const [industrySlug, setIndustrySlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ownerStatus,
          region,
          industrySlug,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "가입에 실패했어요.");
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("가입은 됐는데 로그인에 실패했어요. 로그인 페이지에서 다시 시도해주세요.");
        setLoading(false);
        return;
      }

      router.push("/me");
      router.refresh();
    } catch {
      setError("문제가 생겼어요. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <input
        type="email"
        required
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-xl border border-foreground/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
      />
      <input
        type="password"
        required
        minLength={8}
        placeholder="비밀번호 (8자 이상)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-xl border border-foreground/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
      />
      <input
        required
        placeholder="동네 (예: 동작구)"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="rounded-xl border border-foreground/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
      />
      <select
        required
        value={industrySlug}
        onChange={(e) => setIndustrySlug(e.target.value)}
        className="rounded-xl border border-foreground/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
      >
        <option value="" disabled>
          {ownerStatus === "current" ? "내 업종 선택" : "관심 업종 선택"}
        </option>
        {INDUSTRIES.map((industry) => (
          <option key={industry.slug} value={industry.slug}>
            {industry.name}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "가입 중..." : "가입하기"}
      </button>
    </form>
  );
}
