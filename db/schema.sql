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
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_posts_board_created on posts (board_id, created_at desc);

insert into boards (slug, name, description, sort_order) values
  ('free', '자유게시판', '자유롭게 이야기 나누는 공간', 0),
  ('industry', '업종별 게시판', '같은 업종 사장님들끼리 나누는 이야기', 1),
  ('local', '우리동네 게시판', '지역 기반으로 나누는 동네 정보와 이야기', 2),
  ('franchise', '프랜차이즈 게시판', '프랜차이즈 창업, 운영, 본사 관련 이야기', 3),
  ('topic', '주제별 게시판', '회계, 세무, 마케팅 등 주제별 정보 공유', 4)
on conflict (slug) do nothing;
