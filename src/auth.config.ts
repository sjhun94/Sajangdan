import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      if (isAdminRoute) {
        return isLoggedIn && auth?.user?.role === "admin";
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.ownerStatus = user.ownerStatus;
        token.businessVerificationStatus = user.businessVerificationStatus;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.role = (token.role as string) ?? "user";
      session.user.ownerStatus = (token.ownerStatus as string) ?? "prospective";
      session.user.businessVerificationStatus =
        (token.businessVerificationStatus as string) ?? "none";
      return session;
    },
  },
} satisfies NextAuthConfig;
