import { getBoardBySlug } from "@/lib/boards";
import { getPostById } from "@/lib/posts";
import { getIndustryName } from "@/lib/industries";
import { getTopicName } from "@/lib/topics";
import { OG_SIZE, renderShareCard } from "@/lib/ogCard";

export const alt = "사장단 게시글";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug, postId } = await params;
  const [board, post] = await Promise.all([
    getBoardBySlug(slug),
    getPostById(postId),
  ]);

  if (!board || !post || post.board_id !== board.id) {
    return renderShareCard({
      badges: [],
      title: "우리끼리니까 할 수 있는 말",
      footnote: "",
    });
  }

  const tag =
    getIndustryName(post.industry_slug) ?? getTopicName(post.topic_slug);
  return renderShareCard({
    badges: tag ? [board.name, tag] : [board.name],
    title: post.title,
    footnote: `${post.author_label} · 댓글 ${post.comment_count}`,
  });
}
