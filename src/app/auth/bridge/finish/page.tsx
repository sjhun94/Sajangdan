import { Suspense } from "react";
import { BridgeFinishClient } from "@/components/auth/bridge-finish-client";

export default function AuthBridgeFinishPage() {
  return (
    <Suspense>
      <BridgeFinishClient />
    </Suspense>
  );
}
