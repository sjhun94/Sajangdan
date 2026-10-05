import webpush from "web-push";
import { pool } from "@/lib/db";

let configured = false;
function configure(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export async function savePushSubscription({
  userId,
  endpoint,
  p256dh,
  auth,
}: {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}): Promise<void> {
  // 같은 브라우저가 다른 계정으로 다시 구독하면 소유자를 새 계정으로 바꾼다
  await pool.query(
    `insert into push_subscriptions (user_id, endpoint, p256dh, auth)
     values ($1, $2, $3, $4)
     on conflict (endpoint) do update
       set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth`,
    [userId, endpoint, p256dh, auth]
  );
}

export async function removePushSubscription(
  userId: string,
  endpoint: string
): Promise<void> {
  await pool.query(
    `delete from push_subscriptions where user_id = $1 and endpoint = $2`,
    [userId, endpoint]
  );
}

export type PushPayload = { title: string; body: string; url: string };

// 실패해도 원래 작업(댓글 등록 등)에 영향이 없도록 에러를 밖으로 던지지 않는다.
// 브라우저가 구독을 해지했으면(404/410) DB에서도 지운다.
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<void> {
  if (!configure()) return;
  const { rows } = await pool.query<{
    endpoint: string;
    p256dh: string;
    auth: string;
  }>(`select endpoint, p256dh, auth from push_subscriptions where user_id = $1`, [
    userId,
  ]);

  await Promise.all(
    rows.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await pool.query(`delete from push_subscriptions where endpoint = $1`, [
            sub.endpoint,
          ]);
        } else {
          console.error("push send failed", status, (err as Error).message);
        }
      }
    })
  );
}
