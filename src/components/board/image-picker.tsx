"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

const MAX_SIDE = 1600; // 긴 변 기준 최대 크기(px)
const JPEG_QUALITY = 0.85;

type Item = {
  key: string;
  previewUrl: string;
  url: string | null; // 업로드가 끝나면 채워짐
  failed: boolean;
};

// 사진을 줄여서 JPEG 로 다시 만든다.
// 다시 그리는 과정에서 촬영 위치(GPS) 같은 사진 속 정보가 지워져 익명성도 지켜진다.
async function shrinkImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("변환 실패"))),
      "image/jpeg",
      JPEG_QUALITY
    )
  );
}

export function ImagePicker({
  max,
  onChange,
}: {
  max: number;
  // 업로드된 사진 주소 목록과, 아직 올리는 중인 사진이 있는지
  onChange: (urls: string[], uploading: boolean) => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChange(
      items.flatMap((i) => (i.url ? [i.url] : [])),
      items.some((i) => !i.url && !i.failed)
    );
  }, [items, onChange]);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setError(null);
    const room = max - items.length;
    const picked = Array.from(files).slice(0, room);
    if (files.length > room) setError(`사진은 최대 ${max}장까지 올릴 수 있어요.`);

    for (const file of picked) {
      const key = crypto.randomUUID();
      setItems((prev) => [
        ...prev,
        { key, previewUrl: URL.createObjectURL(file), url: null, failed: false },
      ]);
      try {
        const shrunk = await shrinkImage(file);
        const blob = await upload("post-images/photo.jpg", shrunk, {
          access: "private",
          handleUploadUrl: "/api/posts/image-upload-token",
          contentType: "image/jpeg",
        });
        setItems((prev) =>
          prev.map((i) => (i.key === key ? { ...i, url: blob.url } : i))
        );
      } catch {
        setItems((prev) =>
          prev.map((i) => (i.key === key ? { ...i, failed: true } : i))
        );
        setError("올리지 못한 사진이 있어요. 지우고 다시 올려주세요.");
      }
    }
  }

  function remove(key: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.key === key);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.key !== key);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="relative h-20 w-20 overflow-hidden rounded-xl border border-foreground/15"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt=""
              className={`h-full w-full object-cover ${item.url ? "" : "opacity-40"}`}
            />
            {!item.url && (
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">
                {item.failed ? "실패" : "올리는 중"}
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(item.key)}
              aria-label="사진 빼기"
              className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
            >
              ✕
            </button>
          </div>
        ))}
        {items.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-foreground/20 text-foreground/50 hover:border-accent hover:text-accent"
          >
            <span className="text-lg">📷</span>
            <span className="text-[11px]">
              {items.length}/{max}
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
