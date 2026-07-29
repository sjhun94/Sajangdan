import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createBridgeToken } from "@/lib/authBridge";

export default async function AuthBridgeStartPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const token = await createBridgeToken(session.user.id);
  const deepLink = `com.sajangdan.app://auth-bridge?token=${token}`;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-bold">로그인 완료!</h1>
      <p className="text-sm text-foreground/60">
        앱으로 돌아가는 중이에요. 자동으로 안 넘어가면 아래 버튼을 눌러주세요.
      </p>
      <a
        href={deepLink}
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
      >
        사장단 앱으로 돌아가기
      </a>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = ${JSON.stringify(deepLink)};`,
        }}
      />
    </div>
  );
}
