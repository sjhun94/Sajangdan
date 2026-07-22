import { Client } from "pg";

const boards = [
  ["free", "자유게시판", "자유롭게 이야기 나누는 공간", 0],
  ["industry", "업종별 게시판", "같은 업종 사장님들끼리 나누는 이야기", 1],
  ["local", "우리동네 게시판", "지역 기반으로 나누는 동네 정보와 이야기", 2],
  ["franchise", "프랜차이즈 게시판", "프랜차이즈 창업, 운영, 본사 관련 이야기", 3],
  ["topic", "주제별 게시판", "회계, 세무, 마케팅 등 주제별 정보 공유", 4],
];

const client = new Client({ connectionString: process.env.DATABASE_URL_UNPOOLED });
await client.connect();

const keepSlugs = boards.map((b) => b[0]);
await client.query(
  `delete from boards where slug != all($1::text[])`,
  [keepSlugs]
);

for (const [slug, name, description, sortOrder] of boards) {
  await client.query(
    `insert into boards (slug, name, description, sort_order)
     values ($1, $2, $3, $4)
     on conflict (slug) do update
       set name = excluded.name,
           description = excluded.description,
           sort_order = excluded.sort_order`,
    [slug, name, description, sortOrder]
  );
}

await client.end();
console.log("boards reseeded");
