import { db, s } from "@/db";
import { snapshotToday } from "@/lib/net-worth";

// GET so Vercel Cron can hit it. Auth via CRON_SECRET — Vercel injects
// `Authorization: Bearer <CRON_SECRET>` automatically when the env var is set.
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  const got = req.headers.get("authorization");
  if (!expected || got !== `Bearer ${expected}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const rows = await db
    .selectDistinct({ userId: s.accounts.userId })
    .from(s.accounts);

  let snapshotted = 0;
  const errors: { userId: string; error: string }[] = [];
  for (const { userId } of rows) {
    try {
      await snapshotToday(userId);
      snapshotted++;
    } catch (e) {
      errors.push({ userId, error: (e as Error).message });
    }
  }

  return Response.json({
    ok: true,
    users: rows.length,
    snapshotted,
    errors,
  });
}
