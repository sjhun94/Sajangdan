import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getBoardBySlug } from "@/lib/boards";
import { getPostById, incrementViewCount } from "@/lib/posts";
import { getBlockedUserIds } from "@/lib/blocks";
import { getIndustryName } from "@/lib/industries";
import { getTopicName } from "@/lib/topics";
import { listComments } from "@/lib/comments";
import { getPollForPost } from "@/lib/polls";
import { listPostImageIds } from "@/lib/postImages";
import { SITE_URL } from "@/lib/siteUrl";
import { LikeButton } from "@/components/board/like-button";
import { BookmarkButton } from "@/components/board/bookmark-button";
import { ShareButton } from "@/components/board/share-button";
import { CommentSection } from "@/components/board/comment-section";
import { PollDisplay } from "@/components/board/poll-display";
import { ReportBlockMenu } from "@/components/board/report-block-menu";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}): Promise<Metadata> {
  const { slug, postId } = await params;
  const [board, post] = await Promise.all([
    getBoardBySlug(slug),
    getPostById(postId),
  ]);
  if (!board || !post || post.board_id !== board.id) return {};

  const title = `${post.title} | 사장단 ${board.name}`;
  const description =
    post.content.replace(/\s+/g, " ").trim().slice(0, 100) ||
    "사장님들이 익명으로 나누는 이야기";
  return {
    title,
    description,
    alternates: { canonical: `/board/${board.slug}/${post.id}` },
    openGraph: { title, description, type: "article" },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug, postId } = await params;

  const session = await auth();
  const currentUserId = session?.user?.id;
  const excludeUserIds = await getBlockedUserIds(currentUserId);

  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  await incrementViewCount(postId);
  const post = await getPostById(postId, currentUserId);
  if (!post || post.board_id !== board.id) notFound();
  if (excludeUserIds.includes(post.user_id)) notFound();

  const comments = await listComments(postId, currentUserId, excludeUserIds);
  const poll = await getPollForPost(postId, currentUserId);
  const imageIds = await listPostImageIds(postId);

  // 검색엔진이 "커뮤니티 글"로 알아보도록 구조화 데이터를 넣는다 (화면에 보이는 정보만 사용)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: post.title,
    text: post.content.slice(0, 1000),
    datePublished: new Date(post.created_at).toISOString(),
    url: `${SITE_URL}/board/${board.slug}/${post.id}`,
    author: { "@type": "Person", name: post.author_label },
    image: imageIds.map((id) => `${SITE_URL}/api/post-images/${id}`),
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: post.comment_count,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: post.like_count,
      },
    ],
  };
  const canReportPost = !!currentUserId && post.user_id !== currentUserId;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <div className="flex flex-col gap-3 border-b border-foreground/10 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground/70">
            {post.author_label}
          </span>
          {(post.industry_slug || post.topic_slug) && (
            <span className="w-fit rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-foreground/60">
              {getIndustryName(post.industry_slug) ??
                getTopicName(post.topic_slug)}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold">{post.title}</h1>
        <p className="whitespace-pre-wrap text-sm leading-7">
          {post.content}
        </p>
        {imageIds.length > 0 && (
          <div className="flex flex-col gap-2">
            {imageIds.map((imageId) => (
              <a
                key={imageId}
                href={`/api/post-images/${imageId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/post-images/${imageId}`}
                  alt=""
                  loading="lazy"
                  className="max-h-[480px] w-auto max-w-full rounded-xl border border-foreground/10"
                />
              </a>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 pt-2">
          <LikeButton
            targetType="post"
            targetId={post.id}
            initialLiked={post.liked_by_me}
            initialCount={post.like_count}
          />
          <BookmarkButton
            postId={post.id}
            initialBookmarked={post.bookmarked_by_me}
          />
          <ShareButton title={post.title} />
          <span className="text-xs text-foreground/50">
            조회 {post.view_count} · 댓글 {post.comment_count}
          </span>
          {canReportPost && (
            <ReportBlockMenu targetType="post" targetId={post.id} />
          )}
        </div>
      </div>

      {poll && (
        <PollDisplay
          postId={post.id}
          initialOptions={poll.options}
          initialTotalVotes={poll.totalVotes}
          isLoggedIn={!!currentUserId}
        />
      )}

      <CommentSection
        postId={post.id}
        comments={comments}
        isLoggedIn={!!currentUserId}
      />
    </div>
  );
}
