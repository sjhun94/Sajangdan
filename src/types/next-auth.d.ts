import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    ownerStatus?: string;
    businessVerificationStatus?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      ownerStatus: string;
      businessVerificationStatus: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    ownerStatus?: string;
    businessVerificationStatus?: string;
  }
}
