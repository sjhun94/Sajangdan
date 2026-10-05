// 공유 미리보기 이미지(next/og)는 기본 폰트에 한글이 없어서, 이미지에 실제로
// 들어가는 글자만 Google Fonts에서 잘라 받아온다 (Noto Sans KR, OFL 라이선스).
// User-Agent 없이 요청하면 Google이 woff2 대신 Satori가 읽을 수 있는 ttf를 준다.
export async function loadKoreanFont(
  text: string,
  weight: 400 | 800
): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl)).text();
    const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}
