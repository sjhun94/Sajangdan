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
