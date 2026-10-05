import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/authz";
import { removePushSubscription, savePushSubscription } from "@/lib/push";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const parsed = subscriptionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 구독 정보예요." }, { status: 400 });
  }

  await savePushSubscription({
    userId: session!.user.id,
    endpoint: parsed.data.endpoint,
    p256dh: parsed.data.keys.p256dh,
    auth: parsed.data.keys.auth,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const parsed = z.object({ endpoint: z.string() }).safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  await removePushSubscription(session!.user.id, parsed.data.endpoint);
  return NextResponse.json({ ok: true });
}
