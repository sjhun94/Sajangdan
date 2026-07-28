"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INDUSTRIES } from "@/lib/industries";

export function OnboardingForm() {
  const router = useRouter();
  const [ownerStatus, setOwnerStatus] = useState<"current" | "prospective">(
    "current"
  );
  const [region, setRegion] = useState("");
  const [industrySlug, setIndustrySlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerStatus, region, industrySlug }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "저장에 실패했어요.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("문제가 생겼어요. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setOwnerStatus("current")}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
            ownerStatus === "current"
              ? "border-accent bg-accent text-accent-foreground"
              : "border-foreground/15 text-foreground/60"
          }`}
        >
          현재 사장님
        </button>
        <button
          type="button"
          onClick={() => setOwnerStatus("prospective")}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
            ownerStatus === "prospective"
              ? "border-accent bg-accent text-accent-foreground"
              : "border-foreground/15 text-foreground/60"
          }`}
        >
          예비 사장님
        </button>
      </div>
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
        {loading ? "저장 중..." : "시작하기"}
      </button>
    </form>
  );
}
