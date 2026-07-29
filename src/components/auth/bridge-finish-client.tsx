"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function BridgeFinishClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("잘못된 접근이에요.");
      return;
    }

    signIn("credentials", { bridgeToken: token, redirect: false }).then(
      (result) => {
        if (result?.error) {
          setError("로그인에 실패했어요. 앱에서 다시 시도해주세요.");
          return;
        }
        router.push("/onboarding");
        router.refresh();
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-bold">로그인 중...</h1>
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <p className="text-sm text-foreground/60">잠시만 기다려주세요.</p>
      )}
    </div>
  );
}
