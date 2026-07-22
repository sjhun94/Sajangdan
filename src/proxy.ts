export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|svg|jpg|jpeg|webp)$).*)"],
};
