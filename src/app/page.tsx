import Link from "next/link";
import { MessagesSquare, ShieldCheck, Search } from "lucide-react";
import { auth } from "@/auth";
import { listHotPosts } from "@/lib/posts";
import { getBlockedUserIds } from "@/lib/blocks";
import { listOpenSupportPrograms } from "@/lib/supportPrograms";
import { INDUSTRIES } from "@/lib/industries";
import { TOPICS } from "@/lib/topics";
import { INDUSTRY_SEO, TOPIC_SEO } from "@/lib/seoCopy";
import { formatShortDate } from "@/lib/format";
import { SupportProgramList } from "@/components/board/support-program-list";

export const metadata = {
  title: "사장단 | 자영업자 커뮤니티 - 사장님들의 익명 이야기",
  description:
    "음식점, 카페, 미용실, 편의점, 학원까지. 자영업자 사장님들이 매출·인건비·임대료·창업 고민을 익명으로 나누는 자영업자 커뮤니티 사장단. 소상공인 지원사업 공고도 매일 모아드려요.",
  alternates: { canonical: "/" },
};

// 자주 묻는 질문 (화면에 보이는 내용과 검색엔진용 구조화 데이터를 같이 쓴다)
const FAQS = [
  {
    q: "사장단은 어떤 곳인가요?",
    a: "자영업자 사장님들만을 위한 익명 커뮤니티예요. 매출, 인건비, 임대료, 손님 응대, 창업과 폐업 고민까지 다른 데서 하기 어려운 이야기를 같은 처지의 사장님들과 편하게 나눌 수 있어요.",
  },
  {
    q: "정말 익명인가요?",
    a: "네. 상호나 이름 없이 '동작구 카페사장님'처럼 동네와 업종으로만 표시돼요. 사업자 인증 서류는 관리자만 확인하고 다른 회원에게는 절대 공개되지 않아요.",
  },
  {
    q: "누가 가입할 수 있나요?",
    a: "현재 가게를 운영 중인 사장님은 물론, 창업을 준비 중인 예비 사장님도 가입할 수 있어요. 카카오·구글 등 간편 로그인으로 바로 시작할 수 있어요.",
  },
  {
    q: "이용료가 있나요?",
    a: "없어요. 사장단의 모든 기능은 무료예요. 소상공인 지원사업 공고도 매일 아침 무료로 모아드려요.",
  },
];

const features = [
  {
    icon: MessagesSquare,
    title: "익명 게시판",
    description:
      "상호도, 대표자 이름도 없이 '동작구 카페사장님'처럼 동네와 업종으로만 표시돼요. 어느 동네, 어떤 업종인지는 보이지만 누구인지는 아무도 알 수 없어요.",
  },
  {
    icon: ShieldCheck,
    title: "사업자 인증",
    description:
      "사업자등록증을 올리고 관리자 승인을 받으면 정식 사장단 회원이 돼요. 인증 전에도 자유게시판은 바로 이용할 수 있습니다.",
  },
  {
    icon: Search,
    title: "검색 & 카테고리",
    description:
      "자유게시판, 업종별, 우리동네, 프랜차이즈, 주제별, 알짜정보까지 — 궁금한 주제만 골라 보고, 검색으로 원하는 글을 바로 찾아보세요.",
  },
];

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const excludeUserIds = await getBlockedUserIds(session?.user?.id);
  const [{ results: hotPosts }, { results: programs }] = await Promise.all([
    listHotPosts({ period: "week", excludeUserIds, pageSize: 5 }),
    listOpenSupportPrograms({ group: "small-biz", pageSize: 4 }),
  ]);
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6">
        <section className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
          <h1 className="flex flex-col items-center gap-6">
            <span className="rounded-full border border-foreground/15 px-4 py-1 text-xs font-medium text-foreground/60">
              자영업자 전용 익명 커뮤니티
            </span>
            <span className="text-7xl font-black leading-tight tracking-tight sm:text-8xl">
              사장단
            </span>
          </h1>
          <p className="max-w-md text-base leading-7 text-foreground/70 sm:text-lg">
            우리끼리니까 할 수 있는 말. 음식점, 카페, 미용실, 편의점까지 자영업자
            사장님들의 솔직한 이야기를 익명으로 편하게 나눠보세요.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            {isLoggedIn ? (
              <Link
                href="/board"
                className="rounded-full bg-accent px-8 py-3 text-base font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                게시판 가기
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="rounded-full bg-accent px-8 py-3 text-base font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                >
                  무료로 시작하기
                </Link>
                <Link
                  href="/board"
                  className="rounded-full border border-foreground/15 px-8 py-3 text-base font-semibold text-foreground transition-colors hover:bg-foreground/5"
                >
                  둘러보기
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-2xl border border-foreground/10 p-6"
            >
              <Icon className="h-6 w-6 text-accent" strokeWidth={2} />
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="text-sm leading-6 text-foreground/70">
                {description}
              </p>
            </div>
          ))}
        </section>

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-12 pb-24">
          {hotPosts.length > 0 && (
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">🔥 이번 주 사장님들이 많이 본 글</h2>
                <Link href="/hot" className="text-xs font-medium text-accent">
                  더보기
                </Link>
              </div>
              <div className="flex flex-col divide-y divide-foreground/10 rounded-2xl border border-foreground/10 px-5">
                {hotPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/board/${post.board_slug}/${post.id}`}
                    className="flex flex-col gap-1 py-3 hover:opacity-80"
                  >
                    <span className="text-sm font-medium">{post.title}</span>
                    <span className="text-xs text-foreground/50">
                      {post.board_name} · {post.author_label} ·{" "}
                      {formatShortDate(post.created_at)} · 댓글 {post.comment_count}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">업종별 사장님 커뮤니티</h2>
            <p className="text-sm text-foreground/60">
              같은 업종 사장님들끼리라서 더 솔직하게 나눌 수 있는 이야기가 있어요.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {INDUSTRIES.map((i) => (
                <Link
                  key={i.slug}
                  href={`/board/industry?industry=${i.slug}`}
                  className="break-keep rounded-xl border border-foreground/10 px-3 py-2.5 text-sm transition-colors hover:border-accent hover:text-accent"
                >
                  {INDUSTRY_SEO[i.slug]?.keyword ?? `${i.name} 커뮤니티`}
                </Link>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">자영업 고민, 주제별로 나눠요</h2>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <Link
                  key={t.slug}
                  href={`/board/topic?topic=${t.slug}`}
                  className="rounded-full border border-foreground/10 px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
                >
                  {TOPIC_SEO[t.slug]?.keyword ?? t.name}
                </Link>
              ))}
            </div>
          </section>

          {programs.length > 0 && (
            <section className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">📢 지금 신청할 수 있는 소상공인 지원사업</h2>
                <Link href="/support" className="text-xs font-medium text-accent">
                  전체 보기
                </Link>
              </div>
              <SupportProgramList programs={programs} />
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">자주 묻는 질문</h2>
            <div className="flex flex-col divide-y divide-foreground/10 rounded-2xl border border-foreground/10 px-5">
              {FAQS.map((f) => (
                <div key={f.q} className="flex flex-col gap-1 py-4">
                  <h3 className="text-sm font-semibold">{f.q}</h3>
                  <p className="text-sm leading-6 text-foreground/70">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
