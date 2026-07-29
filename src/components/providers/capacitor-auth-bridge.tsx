"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export function CapacitorAuthBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let removeListener: (() => void) | undefined;

    import("@capacitor/app").then(({ App }) => {
      App.addListener("appUrlOpen", (data) => {
        try {
          const url = new URL(data.url);
          const token = url.searchParams.get("token");
          if (url.host === "auth-bridge" && token) {
            window.location.href = `/auth/bridge/finish?token=${token}`;
          }
        } catch {
          // 잘못된 형식의 딥링크는 무시
        }
      }).then((handle) => {
        removeListener = () => handle.remove();
      });
    });

    return () => {
      removeListener?.();
    };
  }, []);

  return null;
}
