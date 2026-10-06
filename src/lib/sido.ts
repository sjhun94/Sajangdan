// 지원사업 지역(시·도) 목록. 서버·브라우저 양쪽에서 쓰므로 DB 코드와 분리해 둔다.
// agency: 소관기관 이름이 이 단어로 시작하면 그 시·도 공고
export const SIDO_LIST = [
  { key: "서울", agency: "서울" },
  { key: "부산", agency: "부산" },
  { key: "대구", agency: "대구" },
  { key: "인천", agency: "인천" },
  { key: "광주", agency: "광주" },
  { key: "대전", agency: "대전" },
  { key: "울산", agency: "울산" },
  { key: "세종", agency: "세종" },
  { key: "경기", agency: "경기" },
  { key: "강원", agency: "강원" },
  { key: "충북", agency: "충청북도|충북" },
  { key: "충남", agency: "충청남도|충남" },
  { key: "전북", agency: "전북|전라북도" },
  { key: "전남", agency: "전남|전라남도" },
  { key: "경북", agency: "경상북도|경북" },
  { key: "경남", agency: "경상남도|경남" },
  { key: "제주", agency: "제주" },
] as const;
export type Sido = (typeof SIDO_LIST)[number]["key"];

export function isSido(value: string | undefined | null): value is Sido {
  return SIDO_LIST.some((s) => s.key === value);
}

// 고른 지역을 기억하는 쿠키 이름
export const SIDO_COOKIE = "sp_sido";
