import { randomUUID } from "crypto";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { pool } from "@/lib/db";
import { consumeBridgeToken } from "@/lib/authBridge";

type UserRow = {
  id: string;
  email: string;
  password_hash: string | null;
  role: string;
  owner_status: string;
  business_verification_status: string;
};

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "이메일", type: "email" },
      password: { label: "비밀번호", type: "password" },
      bridgeToken: { label: "bridgeToken", type: "text" },
    },
    async authorize(credentials) {
      const bridgeToken = credentials?.bridgeToken;
      if (typeof bridgeToken === "string" && bridgeToken) {
        // 안드로이드 앱: 외부 브라우저에서 SNS 로그인을 마친 뒤, 앱 WebView
        // 세션으로 넘겨받을 때 쓰는 경로 (이메일/비밀번호 없이 토큰만으로 인증)
        const userId = await consumeBridgeToken(bridgeToken);
        if (!userId) return null;

        const { rows: bridgeRows } = await pool.query<UserRow>(
          `select id, email, password_hash, role, owner_status, business_verification_status
           from users where id = $1`,
          [userId]
        );
        const bridgeUser = bridgeRows[0];
        if (!bridgeUser) return null;

        return {
          id: bridgeUser.id,
          email: bridgeUser.email,
          role: bridgeUser.role,
          ownerStatus: bridgeUser.owner_status,
          businessVerificationStatus: bridgeUser.business_verification_status,
        };
      }

      const email = credentials?.email;
      const password = credentials?.password;
      if (typeof email !== "string" || typeof password !== "string") {
        return null;
      }

      const { rows } = await pool.query<UserRow>(
        `select id, email, password_hash, role, owner_status, business_verification_status
         from users where email = $1`,
        [email]
      );
      const user = rows[0];
      if (!user || !user.password_hash) return null;

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        ownerStatus: user.owner_status,
        businessVerificationStatus: user.business_verification_status,
      };
    },
  }),
];

// 카카오/구글/네이버는 개발자 콘솔에서 키를 발급받기 전까지는 목록에서 빠져있어요.
if (process.env.AUTH_KAKAO_ID) providers.push(Kakao);
if (process.env.AUTH_GOOGLE_ID) providers.push(Google);
if (process.env.AUTH_NAVER_ID) providers.push(Naver);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      if (!user.email) return false;

      // 간편로그인은 next-auth DB 어댑터를 안 쓰기 때문에, users 테이블에
      // 직접 upsert 해줘야 role/owner_status 등을 이어서 쓸 수 있어요.
      const { rows } = await pool.query<UserRow>(
        `select id, email, password_hash, role, owner_status, business_verification_status
         from users where email = $1`,
        [user.email]
      );

      let existing = rows[0];
      if (!existing) {
        // 동네/업종/현재-예비사장님 여부를 아직 안 골랐으니 onboarding_completed=false로
        // 시작 — /onboarding 페이지가 이 값을 보고 프로필 입력을 유도함
        const inserted = await pool.query<UserRow>(
          `insert into users (id, email, oauth_provider, owner_status, onboarding_completed)
           values ($1, $2, $3, 'prospective', false)
           returning id, email, password_hash, role, owner_status, business_verification_status`,
          [randomUUID(), user.email, account?.provider ?? null]
        );
        existing = inserted.rows[0];
      }

      user.id = existing.id;
      user.role = existing.role;
      user.ownerStatus = existing.owner_status;
      user.businessVerificationStatus = existing.business_verification_status;
      return true;
    },
  },
});
