import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reviewLog } from "@/lib/db/schema";

export async function GET() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayStart = startOfToday.getTime();
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const [todayRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviewLog)
    .where(sql`${reviewLog.reviewedAt} >= ${todayStart}`);

  const [weekRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviewLog)
    .where(sql`${reviewLog.reviewedAt} >= ${weekStart}`);

  const [weekSuccessRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviewLog)
    .where(sql`${reviewLog.reviewedAt} >= ${weekStart} and ${reviewLog.grade} >= 4`);

  const todayCount = Number(todayRow?.count ?? 0);
  const weekCount = Number(weekRow?.count ?? 0);
  const weekSuccessCount = Number(weekSuccessRow?.count ?? 0);

  const successRate =
    weekCount > 0 ? Math.round((weekSuccessCount / weekCount) * 100) : null;

  return NextResponse.json({ todayCount, weekCount, successRate });
}
