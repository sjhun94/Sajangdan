// 사이트 기본 주소 (검색엔진용 사이트맵·robots, 메타데이터에서 같이 쓴다)
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://worktalk-one.vercel.app"
).replace(/\/$/, "");
