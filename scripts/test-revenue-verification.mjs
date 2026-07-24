import { readFileSync } from "node:fs";
import { upload } from "@vercel/blob/client";

const BASE = "http://localhost:3001";
const EMAIL = "revenue-test@example.com";
const PASSWORD = "testpassword123";
const ADMIN_EMAIL = "master";
const ADMIN_PASSWORD = process.argv[2];

if (!ADMIN_PASSWORD) {
  console.error(
    "사용법: node --env-file=.env.local scripts/test-revenue-verification.mjs <master 비밀번호>"
  );
  process.exit(1);
}

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

async function login(email, password) {
  const jar = new Map();
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  parseCookies(csrfRes, jar);
  const { csrfToken } = await csrfRes.json();
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader(jar),
    },
    body: new URLSearchParams({ email, password, csrfToken, json: "true" }),
    redirect: "manual",
  });
  parseCookies(res, jar);
  const sessionRes = await fetch(`${BASE}/api/auth/session`, {
    headers: { Cookie: cookieHeader(jar) },
  });
  const session = await sessionRes.json();
  return { jar, session };
}

// 0. 테스트 계정 생성 + 로그인
await fetch(`${BASE}/api/auth/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: EMAIL,
    password: PASSWORD,
    ownerStatus: "current",
    region: "동작구",
    industrySlug: "cafe",
  }),
});

const { jar, session } = await login(EMAIL, PASSWORD);
console.log("1. test user session:", session?.user);
if (!session?.user) {
  console.error("테스트 계정 로그인 실패");
  process.exit(1);
}

const filePath =
  "C:/Users/sjhun/AppData/Local/Temp/claude/C--sjh-yourpa/f114a4f6-f38d-4a58-bcb0-fa7390d473d7/scratchpad/test-business-cert.png";
const fileBuffer = readFileSync(filePath);

// 1. 사업자 인증 제출
const bizBlob = await upload("biz-cert.png", fileBuffer, {
  access: "private",
  handleUploadUrl: `${BASE}/api/verification/upload-token`,
  contentType: "image/png",
  headers: { Cookie: cookieHeader(jar) },
});
const bizConfirmRes = await fetch(`${BASE}/api/verification/confirm`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookieHeader(jar) },
  body: JSON.stringify({ blobUrl: bizBlob.url, filename: "biz-cert.png" }),
});
const bizConfirmData = await bizConfirmRes.json();
console.log("2. business verification submit:", bizConfirmRes.status, bizConfirmData);

// 2. 관리자 로그인 + 사업자 인증 승인
const { jar: adminJar, session: adminSession } = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
console.log("3. admin session:", adminSession?.user);
if (!adminSession?.user || adminSession.user.role !== "admin") {
  console.error("관리자 로그인 실패");
  process.exit(1);
}

const bizApproveRes = await fetch(
  `${BASE}/api/admin/verifications/${bizConfirmData.id}`,
  {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader(adminJar) },
    body: JSON.stringify({ action: "approve" }),
  }
);
console.log("4. business verification approve:", bizApproveRes.status, await bizApproveRes.json());

// 3. 매출 인증 제출 (사업자 인증 승인된 상태이므로 가능해야 함)
const revenueBlob = await upload("revenue-cert.png", fileBuffer, {
  access: "private",
  handleUploadUrl: `${BASE}/api/revenue/upload-token`,
  contentType: "image/png",
  headers: { Cookie: cookieHeader(jar) },
});
const revenueConfirmRes = await fetch(`${BASE}/api/revenue/confirm`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookieHeader(jar) },
  body: JSON.stringify({
    blobUrl: revenueBlob.url,
    filename: "revenue-cert.png",
    revenueTier: "3",
    yearsInBusiness: 5,
  }),
});
const revenueConfirmData = await revenueConfirmRes.json();
console.log("5. revenue verification submit:", revenueConfirmRes.status, revenueConfirmData);

// 4. 관리자 승인
const revenueApproveRes = await fetch(
  `${BASE}/api/admin/revenue-verifications/${revenueConfirmData.id}`,
  {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader(adminJar) },
    body: JSON.stringify({ action: "approve" }),
  }
);
console.log("6. revenue verification approve:", revenueApproveRes.status, await revenueApproveRes.json());

// 5. 최종 게시글 작성 후 라벨 확인
const postRes = await fetch(`${BASE}/api/posts`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookieHeader(jar) },
  body: JSON.stringify({
    boardSlug: "free",
    title: "매출 인증 라벨 테스트",
    content: "라벨에 (5년차 3억)이 붙어야 함",
  }),
});
const postData = await postRes.json();
console.log("7. post created:", postRes.status, postData);

const listRes = await fetch(`${BASE}/api/boards`);
void listRes;

const finalSessionRes = await fetch(`${BASE}/api/auth/session`, {
  headers: { Cookie: cookieHeader(jar) },
});
console.log("8. final session (note: JWT won't reflect new status until re-login):", await finalSessionRes.json());

console.log("\npost id for manual/browser check:", postData.id);
