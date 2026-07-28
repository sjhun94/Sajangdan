export type SnsProvider = "kakao" | "google" | "naver";

export function getEnabledSnsProviders(): SnsProvider[] {
  const providers: SnsProvider[] = [];
  if (process.env.AUTH_KAKAO_ID) providers.push("kakao");
  if (process.env.AUTH_GOOGLE_ID) providers.push("google");
  if (process.env.AUTH_NAVER_ID) providers.push("naver");
  return providers;
}
