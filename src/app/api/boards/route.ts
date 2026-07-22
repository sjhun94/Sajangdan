import { NextResponse } from "next/server";
import { listBoards } from "@/lib/boards";

export async function GET() {
  const boards = await listBoards();
  return NextResponse.json({ boards });
}
