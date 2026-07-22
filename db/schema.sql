-- 사장단 (worktalk) DB 스키마
-- Neon SQL 콘솔에서 이 파일 전체를 한 번 실행하세요.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,               -- 이메일 가입 시에만 값 있음. 간편로그인 전용 계정은 null
  oauth_provider text,               -- 'kakao' | 'google' | 'naver' | null (이메일 가입은 null)
  owner_status text not null default 'prospective'
    check (owner_status in ('current', 'prospective')), -- 현재 사장님 / 예비 사장님
  role text not null default 'user'
    check (role in ('user', 'admin')),
  business_verification_status text not null default 'none'
    check (business_verification_status in ('none', 'pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_users_email on users (email);

create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id),
  user_id uuid not null references users(id), -- 내부용. 응답에는 절대 노출하지 않음
  title text not null,
  content text not null,
  like_count int not null default 0,
  comment_count int not null default 0,
  next_anon_number int not null default 1, -- 이 글 안에서 다음에 부여할 "익명N" 번호
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- 기존에 posts 테이블이 이미 있던 경우를 위한 안전장치 (없으면 컬럼 추가)
alter table posts add column if not exists next_anon_number int not null default 1;

create index if not exists idx_posts_board_created on posts (board_id, created_at desc);

-- 글쓴이를 제외한, 댓글로 처음 참여한 사람에게 글 단위로 "익명N" 번호를 부여
create table if not exists post_participants (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id),
  user_id uuid not null references users(id),
  anon_number int not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists idx_post_participants_post on post_participants (post_id);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id),
  user_id uuid not null references users(id), -- 내부용. 응답에는 절대 노출하지 않음
  parent_comment_id uuid references comments(id), -- null이면 원댓글, 있으면 답글 (1단계까지만 허용)
  content text not null,
  like_count int not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_comments_post_created on comments (post_id, created_at);

create table if not exists post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id),
  user_id uuid not null references users(id),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references comments(id),
  user_id uuid not null references users(id),
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

create table if not exists business_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  blob_url text not null,
  original_filename text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewer_admin_id uuid references users(id),
  reject_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_business_verifications_status on business_verifications (status);
create index if not exists idx_business_verifications_user on business_verifications (user_id);

insert into boards (slug, name, description, sort_order) values
  ('free', '자유게시판', '자유롭게 이야기 나누는 공간', 0),
  ('industry', '업종별 게시판', '같은 업종 사장님들끼리 나누는 이야기', 1),
  ('local', '우리동네 게시판', '지역 기반으로 나누는 동네 정보와 이야기', 2),
  ('franchise', '프랜차이즈 게시판', '프랜차이즈 창업, 운영, 본사 관련 이야기', 3),
  ('topic', '주제별 게시판', '회계, 세무, 마케팅 등 주제별 정보 공유', 4),
  ('info', '자영업자 알짜정보', '정부지원 등 자영업자에게 유용한 알짜 정보 공유', 5)
on conflict (slug) do nothing;
