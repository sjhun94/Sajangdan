import { NextResponse } from "next/server";
import {
  fetchBizinfoPrograms,
  saveSupportPrograms,
} from "@/lib/supportPrograms";

// Vercel Cron이 매일 호출 (vercel.json). Vercel은 CRON_SECRET 환경변수가 있으면
// Authorization: Bearer <CRON_SECRET> 헤더를 붙여 보내므로, 그 값으로 외부 호출을 막는다.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.BIZINFO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ skipped: "BIZINFO_API_KEY 미설정" });
  }

  const programs = await fetchBizinfoPrograms(apiKey);
  const inserted = await saveSupportPrograms(programs);
  return NextResponse.json({ fetched: programs.length, inserted });
}
