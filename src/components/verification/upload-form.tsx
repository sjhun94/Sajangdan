"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

export function VerificationUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setLoading(true);

    try {
      const blob = await upload(file.name, file, {
        access: "private",
        handleUploadUrl: "/api/verification/upload-token",
      });

      const res = await fetch("/api/verification/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blobUrl: blob.url, filename: file.name }),
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
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        required
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="rounded-xl border border-foreground/15 bg-transparent px-4 py-3 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent-foreground focus:border-accent"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading || !file}
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "제출 중..." : "제출하기"}
      </button>
    </form>
  );
}
