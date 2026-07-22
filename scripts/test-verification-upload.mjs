import { readFileSync } from "node:fs";
import { upload } from "@vercel/blob/client";

const BASE = "http://localhost:3001";
const EMAIL = process.argv[2] ?? "verify-test@example.com";
const PASSWORD = "testpassword123";

function parseCookies(res, jar) {
  const setCookie = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookie) {
    const [pair] = c.split(";");
    const [name, value] = pair.split("=");
    jar.set(name, value);
  }
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

const jar = new Map();

// 0. 계정 생성 (이미 있으면 무시)
const signupRes = await fetch(`${BASE}/api/auth/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: EMAIL,
    password: PASSWORD,
    ownerStatus: "current",
  }),
});
console.log("signup status:", signupRes.status, await signupRes.text());

// 1. CSRF 토큰 발급
const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
parseCookies(csrfRes, jar);
const { csrfToken } = await csrfRes.json();

// 2. 이메일/비밀번호 로그인
const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Cookie: cookieHeader(jar),
  },
  body: new URLSearchParams({
    email: EMAIL,
    password: PASSWORD,
    csrfToken,
    json: "true",
  }),
  redirect: "manual",
});
parseCookies(loginRes, jar);
console.log("login status:", loginRes.status);
console.log("login body:", await loginRes.text());
console.log("cookies after login:", [...jar.keys()]);

const sessionRes = await fetch(`${BASE}/api/auth/session`, {
  headers: { Cookie: cookieHeader(jar) },
});
const session = await sessionRes.json();
console.log("session:", session);

if (!session?.user) {
  console.error("로그인 실패 - 세션 없음");
  process.exit(1);
}

// 3. 실제 파일을 Blob에 업로드 (upload-token 라우트를 거쳐 client token 발급 -> Blob 직접 업로드)
const filePath =
  "C:/Users/sjhun/AppData/Local/Temp/claude/C--sjh-yourpa/f114a4f6-f38d-4a58-bcb0-fa7390d473d7/scratchpad/test-business-cert.png";
const fileBuffer = readFileSync(filePath);

const blob = await upload("test-business-cert.png", fileBuffer, {
  access: "private",
  handleUploadUrl: `${BASE}/api/verification/upload-token`,
  contentType: "image/png",
  headers: { Cookie: cookieHeader(jar) },
});
console.log("uploaded blob:", blob.url);

// 4. confirm 라우트 호출 (DB에 pending 신청 기록)
const confirmRes = await fetch(`${BASE}/api/verification/confirm`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Cookie: cookieHeader(jar),
  },
  body: JSON.stringify({ blobUrl: blob.url, filename: "test-business-cert.png" }),
});
const confirmData = await confirmRes.json();
console.log("confirm status:", confirmRes.status, confirmData);
