"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { REVENUE_TIERS } from "@/lib/revenue";

export function RevenueUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [revenueTier, setRevenueTier] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !revenueTier || !yearsInBusiness) return;
    setError(null);
    setLoading(true);

    try {
      const blob = await upload(file.name, file, {
        access: "private",
        handleUploadUrl: "/api/revenue/upload-token",
      });

      const res = await fetch("/api/revenue/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blobUrl: blob.url,
          filename: file.name,
          revenueTier,
          yearsInBusiness: Number(yearsInBusiness),
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "제출에 실패했어요.");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("업로드 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <select
        required
        value={revenueTier}
        onChange={(e) => setRevenueTier(e.target.value)}
        className="rounded-xl border border-foreground/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
      >
        <option value="" disabled>
          작년 연매출 구간 선택
        </option>
        {REVENUE_TIERS.map((tier) => (
          <option key={tier.value} value={tier.value}>
            {tier.label}
          </option>
        ))}
      </select>
      <input
        type="number"
        required
        min={0}
        max={100}
        placeholder="몇 년차인가요? (예: 5)"
        value={yearsInBusiness}
        onChange={(e) => setYearsInBusiness(e.target.value)}
        className="rounded-xl border border-foreground/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
      />
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        required
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="rounded-xl border border-foreground/15 bg-transparent px-4 py-3 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent-foreground focus:border-accent"
      />
      <p className="text-xs text-foreground/50">
        홈택스 &gt; 민원증명 &gt; 부가가치세 과세표준증명 등 매출을 확인할 수
        있는 국세청 증명서를 첨부해주세요.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading || !file || !revenueTier || !yearsInBusiness}
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "제출 중..." : "제출하기"}
      </button>
    </form>
  );
}
