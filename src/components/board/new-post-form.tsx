"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { requestPushPrompt } from "@/lib/webPushClient";
import { INDUSTRIES } from "@/lib/industries";
import { TOPICS } from "@/lib/topics";
import { ImagePicker } from "@/components/board/image-picker";

const MAX_IMAGES = 5;

const MAX_POLL_OPTIONS = 6;
const MIN_POLL_OPTIONS = 2;

export function NewPostForm({ boardSlug }: { boardSlug: string }) {
  const router = useRouter();
  const isIndustryBoard = boardSlug === "industry";
  const isTopicBoard = boardSlug === "topic";
  const isPollBoard = boardSlug === "poll";
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [industrySlug, setIndustrySlug] = useState("");
  const [topicSlug, setTopicSlug] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagesUploading, setImagesUploading] = useState(false);
  const handleImagesChange = useCallback(
    (urls: string[], uploading: boolean) => {
      setImageUrls(urls);
      setImagesUploading(uploading);
    },
    []
  );

  function updatePollOption(index: number, value: string) {
    setPollOptions((prev) =>
      prev.map((option, i) => (i === index ? value : option))
    );
  }

  function addPollOption() {
    setPollOptions((prev) =>
      prev.length < MAX_POLL_OPTIONS ? [...prev, ""] : prev
    );
  }

  function removePollOption(index: number) {
    setPollOptions((prev) =>
      prev.length > MIN_POLL_OPTIONS
        ? prev.filter((_, i) => i !== index)
        : prev
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (imagesUploading) {
      setError("사진을 올리는 중이에요. 잠시만 기다려주세요.");
      return;
    }
    if (isIndustryBoard && !industrySlug) {
      setError("업종을 선택해주세요.");
      return;
    }
    if (isTopicBoard && !topicSlug) {
      setError("주제를 선택해주세요.");
      return;
    }
    const trimmedOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (isPollBoard && trimmedOptions.length < MIN_POLL_OPTIONS) {
      setError("선택지를 2개 이상 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardSlug,
          title,
          content,
          industrySlug: isIndustryBoard ? industrySlug : undefined,
          topicSlug: isTopicBoard ? topicSlug : undefined,
          pollOptions: isPollBoard ? trimmedOptions : undefined,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "글쓰기에 실패했어요.");
        setLoading(false);
        return;
      }

      requestPushPrompt("post");
      router.push(`/board/${boardSlug}/${data.id}`);
      router.refresh();
    } catch {
      setError("문제가 생겼어요. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {isIndustryBoard && (
        <select
          required
          value={industrySlug}
          onChange={(e) => setIndustrySlug(e.target.value)}
          className="rounded-xl border border-foreground/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
        >
          <option value="" disabled>
            업종을 선택하세요
          </option>
          {INDUSTRIES.map((industry) => (
            <option key={industry.slug} value={industry.slug}>
              {industry.name}
            </option>
          ))}
        </select>
      )}
      {isTopicBoard && (
        <select
          required
          value={topicSlug}
          onChange={(e) => setTopicSlug(e.target.value)}
          className="rounded-xl border border-foreground/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
        >
          <option value="" disabled>
            주제를 선택하세요
          </option>
          {TOPICS.map((topic) => (
            <option key={topic.slug} value={topic.slug}>
              {topic.name}
            </option>
          ))}
        </select>
      )}
      <input
        required
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-xl border border-foreground/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
      />
      <textarea
        required
        placeholder="내용을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={isPollBoard ? 5 : 10}
        className="rounded-xl border border-foreground/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
      />
      <ImagePicker max={MAX_IMAGES} onChange={handleImagesChange} />
      {isPollBoard && (
        <div className="flex flex-col gap-2 rounded-xl border border-foreground/15 p-3">
          <span className="text-xs font-medium text-foreground/60">
            투표 선택지 (2~{MAX_POLL_OPTIONS}개)
          </span>
          {pollOptions.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                required
                placeholder={`선택지 ${index + 1}`}
                value={option}
                onChange={(e) => updatePollOption(index, e.target.value)}
                className="flex-1 rounded-xl border border-foreground/15 bg-transparent px-4 py-2 text-sm outline-none focus:border-accent"
              />
              {pollOptions.length > MIN_POLL_OPTIONS && (
                <button
                  type="button"
                  onClick={() => removePollOption(index)}
                  className="rounded-xl border border-foreground/15 px-3 text-sm text-foreground/50 hover:text-foreground"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          {pollOptions.length < MAX_POLL_OPTIONS && (
            <button
              type="button"
              onClick={addPollOption}
              className="rounded-xl border border-dashed border-foreground/20 px-4 py-2 text-sm text-foreground/60 hover:border-accent hover:text-accent"
            >
              + 선택지 추가
            </button>
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading || imagesUploading}
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading
          ? "등록 중..."
          : imagesUploading
            ? "사진 올리는 중..."
            : "등록하기"}
      </button>
    </form>
  );
}
