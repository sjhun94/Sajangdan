import { pool } from "@/lib/db";

// 욕설은 글 등록을 막지 않고 가린다 (익명 하소연 커뮤니티라 막으면 오히려 이탈함).
// 띄어쓰기/특수문자를 끼워 넣는 우회("씨 발", "씨.발")도 잡도록 글자 사이에 구분자를 허용.
const PROFANITY = [
  "씨발",
  "씨팔",
  "시발",
  "시바",
  "ㅅㅂ",
  "ㅆㅂ",
  "병신",
  "ㅂㅅ",
  "븅신",
  "개새끼",
  "개새기",
  "개색기",
  "새끼야",
  "좆",
  "존나",
  "졸라",
  "ㅈㄴ",
  "지랄",
  "ㅈㄹ",
  "미친놈",
  "미친년",
  "엠창",
  "느금마",
  "니애미",
  "니미",
];

// 욕설 목록과 겹치지만 정상적인 단어 (가리면 안 됨)
const ALLOWED_WORDS = ["시발점", "시바견"];

const SEPARATOR = "[\\s.,·_\\-*~!?]*";

const profanityRegex = new RegExp(
  PROFANITY.map((word) => [...word].join(SEPARATOR)).join("|"),
  "g"
);

export function maskProfanity(text: string): string {
  const placeholders: string[] = [];
  let protectedText = text;
  ALLOWED_WORDS.forEach((word) => {
    protectedText = protectedText.split(word).join(`\u0000${placeholders.length}\u0000`);
    placeholders.push(word);
  });

  const masked = protectedText.replace(profanityRegex, (match) =>
    "*".repeat([...match.replace(/[\s.,·_\-*~!?]/g, "")].length)
  );

  return masked.replace(/\u0000(\d+)\u0000/g, (_, i) => placeholders[Number(i)]);
}

const PHONE_REGEX = /01[016789][\s.\-]?\d{3,4}[\s.\-]?\d{4}/;
const PROMO_LINK_REGEX =
  /(open\.kakao\.com|pf\.kakao\.com|t\.me\/|telegram\.me|band\.us\/n\/|discord\.gg)/i;
const URL_REGEX = /https?:\/\/|www\./gi;
const REPEATED_CHAR_REGEX = /(.)\1{29,}/;

// 스팸으로 보이는 글은 등록 자체를 막는다. 문제 없으면 null.
export function findSpamReason(text: string): string | null {
  if (PHONE_REGEX.test(text)) {
    return "개인 연락처(전화번호)는 남길 수 없어요. 익명 커뮤니티라 본인 보호를 위해 막고 있어요.";
  }
  if (PROMO_LINK_REGEX.test(text)) {
    return "오픈채팅·텔레그램 등 홍보성 링크는 남길 수 없어요.";
  }
  if ((text.match(URL_REGEX) ?? []).length > 2) {
    return "링크는 한 글에 2개까지만 남길 수 있어요.";
  }
  if (REPEATED_CHAR_REGEX.test(text)) {
    return "같은 글자를 너무 많이 반복했어요.";
  }
  return null;
}

// 같은 사람이 1시간 안에 똑같은 내용을 또 올리는 도배 방지
export async function isDuplicateRecent({
  table,
  userId,
  content,
}: {
  table: "posts" | "comments";
  userId: string;
  content: string;
}): Promise<boolean> {
  const { rows } = await pool.query(
    `select 1 from ${table}
     where user_id = $1 and content = $2 and deleted_at is null
       and created_at >= now() - interval '1 hour'
     limit 1`,
    [userId, content]
  );
  return rows.length > 0;
}
