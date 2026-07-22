import Link from "next/link";
import { listBoards } from "@/lib/boards";

export default async function BoardListPage() {
  const boards = await listBoards();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-black">게시판</h1>

      <form action="/search" className="flex gap-2">
        <input
          type="text"
          name="q"
          placeholder="전체 게시판에서 검색"
          className="flex-1 rounded-xl border border-foreground/15 bg-transparent px-4 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-xl border border-foreground/15 px-4 py-2 text-sm font-medium"
        >
          검색
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/board/${board.slug}`}
            className="rounded-2xl border border-foreground/10 p-5 transition-colors hover:border-accent"
          >
            <div className="font-bold">{board.name}</div>
            <div className="text-sm text-foreground/60">
              {board.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
