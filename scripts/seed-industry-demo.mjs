import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { Client } from "pg";

const client = new Client({ connectionString: process.env.DATABASE_URL_UNPOOLED });
await client.connect();

const passwordHash = await bcrypt.hash("demo-seed-not-a-real-login", 10);

async function ensureUser({ email, region, industrySlug, ownerStatus }) {
  const existing = await client.query("select id from users where email = $1", [email]);
  if (existing.rows[0]) return existing.rows[0].id;

  const id = randomUUID();
  await client.query(
    `insert into users (id, email, password_hash, owner_status, region, industry_slug)
     values ($1, $2, $3, $4, $5, $6)`,
    [id, email, passwordHash, ownerStatus, region, industrySlug]
  );
  return id;
}

const { rows: boardRows } = await client.query(
  "select id from boards where slug = 'industry'"
);
const industryBoardId = boardRows[0].id;

// 가상 데모 계정 (실제 로그인 불가능한 더미 비밀번호)
const users = {
  cafeGangnam: await ensureUser({
    email: "demo.cafe.gangnam@sajangdan.demo",
    region: "강남구",
    industrySlug: "cafe",
    ownerStatus: "current",
  }),
  convSuwon: await ensureUser({
    email: "demo.conv.suwon@sajangdan.demo",
    region: "수원시 팔달구",
    industrySlug: "convenience",
    ownerStatus: "current",
  }),
  fitnessHaeundae: await ensureUser({
    email: "demo.fitness.haeundae@sajangdan.demo",
    region: "해운대구",
    industrySlug: "fitness",
    ownerStatus: "current",
  }),
  deliveryBupyeong: await ensureUser({
    email: "demo.delivery.bupyeong@sajangdan.demo",
    region: "부평구",
    industrySlug: "delivery-only",
    ownerStatus: "prospective",
  }),
  beautySuseong: await ensureUser({
    email: "demo.beauty.suseong@sajangdan.demo",
    region: "수성구",
    industrySlug: "beauty",
    ownerStatus: "current",
  }),
  cafeMapo: await ensureUser({
    email: "demo.cafe.mapo@sajangdan.demo",
    region: "마포구",
    industrySlug: "cafe",
    ownerStatus: "current",
  }),
};

async function createPost({ userId, industrySlug, title, content }) {
  const { rows } = await client.query(
    `insert into posts (id, board_id, user_id, title, content, industry_slug)
     values ($1, $2, $3, $4, $5, $6)
     returning id`,
    [randomUUID(), industryBoardId, userId, title, content, industrySlug]
  );
  return rows[0].id;
}

async function createComment({ postId, userId, content, parentCommentId }) {
  const { rows } = await client.query(
    `insert into comments (id, post_id, user_id, content, parent_comment_id)
     values ($1, $2, $3, $4, $5)
     returning id`,
    [randomUUID(), postId, userId, content, parentCommentId ?? null]
  );
  await client.query(`update posts set comment_count = comment_count + 1 where id = $1`, [postId]);
  return rows[0].id;
}

// 게시글 1: 카페 - 원두 단가
const post1 = await createPost({
  userId: users.cafeGangnam,
  industrySlug: "cafe",
  title: "원두 단가 또 올랐네요... 다들 가격 어떻게 하세요",
  content:
    "이번 달에 원두 단가가 또 올라서 고민이 많습니다. 아메리카노 가격을 올려야 하나 싶은데, 손님들 반응이 걱정돼서 미루고 있어요. 다른 카페 사장님들은 어떻게 대응하고 계신가요?",
});
const c1a = await createComment({
  postId: post1,
  userId: users.cafeMapo,
  content: "저희도 똑같은 고민이에요. 결국 저번 달에 500원씩 올렸는데 아직까진 큰 이탈은 없더라고요.",
});
await createComment({
  postId: post1,
  userId: users.cafeGangnam,
  content: "오 그래도 이탈이 크지 않았다니 다행이네요. 저도 조금씩 올려봐야겠어요.",
  parentCommentId: c1a,
});
await createComment({
  postId: post1,
  userId: users.fitnessHaeundae,
  content: "업종은 다르지만 저희도 마찬가지예요. 원자재/재료비는 오르는데 가격은 올리기 무섭고, 다들 비슷한 고민이신 듯.",
});

// 게시글 2: 편의점 - 야간 알바
const post2 = await createPost({
  userId: users.convSuwon,
  industrySlug: "convenience",
  title: "편의점 야간 알바 구하기 진짜 힘드네요",
  content:
    "야간 시간대(밤 11시~아침 7시) 알바 구인 올린 지 3주째인데 지원자가 거의 없어요. 시급을 좀 더 올려야 하나 고민 중인데, 비슷한 경험 있으신 분 계신가요?",
});
const c2a = await createComment({
  postId: post2,
  userId: users.deliveryBupyeong,
  content: "저는 아직 예비창업자라 직접 경험은 없지만, 주변에서 야간은 시급+야간수당 조금만 더 챙겨줘도 지원율이 확 달라진다고 하더라고요.",
});
await createComment({
  postId: post2,
  userId: users.convSuwon,
  content: "그런가요? 참고해서 공고 조건 좀 손봐야겠어요, 감사합니다!",
  parentCommentId: c2a,
});

// 게시글 3: 헬스장 - 회원권 마케팅
const post3 = await createPost({
  userId: users.fitnessHaeundae,
  industrySlug: "fitness",
  title: "여름 시즌 회원권 프로모션 어떻게들 하세요?",
  content:
    "매년 여름 되면 신규 회원 문의는 느는데 실제 등록까지 이어지는 비율이 낮아서 고민입니다. 다들 여름 시즌 프로모션 어떤 식으로 하시는지 공유 부탁드려요.",
});
await createComment({
  postId: post3,
  userId: users.beautySuseong,
  content: "저희 업종은 아니지만, 인스타로 전후 사진(비포/애프터) 공유 이벤트 하는 헬스장들 반응 괜찮아 보이던데 참고해보세요.",
});

// 게시글 4: 뷰티 - 예약 시스템
const post4 = await createPost({
  userId: users.beautySuseong,
  industrySlug: "beauty",
  title: "네일샵 예약 시스템 뭐 쓰세요? 노쇼 때문에 골치아파요",
  content:
    "전화 예약만 받다 보니 노쇼가 너무 잦아서 온라인 예약 시스템 도입을 고민 중이에요. 실제로 쓰고 계신 분들 후기 좀 들려주세요.",
});
await createComment({
  postId: post4,
  userId: users.cafeGangnam,
  content: "저희 카페도 예약제 손님 받을 때 비슷한 앱 써봤는데, 노쇼 시 선결제 걸어두는 옵션 있는 곳으로 알아보시면 확실히 줄어들어요.",
});

console.log("done:", { post1, post2, post3, post4 });
await client.end();
