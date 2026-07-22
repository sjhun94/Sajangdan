import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBoardBySlug } from "@/lib/boards";
import { NewPostForm } from "@/components/board/new-post-form";

export default async function NewPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user) redirect("/login");

  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-black">{board.name}에 글쓰기</h1>
      <NewPostForm boardSlug={slug} />
    </div>
  );
}
