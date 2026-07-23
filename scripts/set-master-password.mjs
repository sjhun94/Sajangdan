// 사용법: node --env-file=.env.local scripts/set-master-password.mjs <새 비밀번호>
// 비밀번호를 스크립트에 하드코딩하지 않음 (이 저장소는 public이라 커밋 시 노출됨)
import bcrypt from "bcryptjs";
import { Client } from "pg";

const EMAIL = "master";
const PASSWORD = process.argv[2];

if (!PASSWORD) {
  console.error("사용법: node --env-file=.env.local scripts/set-master-password.mjs <새 비밀번호>");
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL_UNPOOLED });
await client.connect();

const passwordHash = await bcrypt.hash(PASSWORD, 10);
await client.query(
  `update users set password_hash = $1, role = 'admin', business_verification_status = 'approved' where email = $2`,
  [passwordHash, EMAIL]
);

// 검증: 방금 저장한 해시로 실제 비교까지 확인
const { rows } = await client.query(
  "select password_hash from users where email = $1",
  [EMAIL]
);
const verifyOk = await bcrypt.compare(PASSWORD, rows[0].password_hash);
console.log("password updated, self-check:", verifyOk);

await client.end();
