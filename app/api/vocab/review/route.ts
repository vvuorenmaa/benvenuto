import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { vocabCards, reviewLog } from "@/lib/db/schema";
import { computeVocabStatus } from "@/lib/vocab/status";
import { computeNextReview } from "@/lib/db/srs";

const reviewSchema = z.object({
  cardId: z.number().int(),
  grade: z.enum(["hard", "good", "easy"]),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { cardId, grade } = parsed.data;

  const existing = await db
    .select()
    .from(vocabCards)
    .where(eq(vocabCards.id, cardId));

  const card = existing[0];

  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = computeNextReview(
    {
      easeFactor: card.easeFactor,
      intervalDays: card.intervalDays,
      repetitions: card.repetitions,
    },
    grade,
  );

  const now = Date.now();
  const intervalBefore = card.intervalDays;

  const updated = await db
    .update(vocabCards)
    .set({
      easeFactor: result.easeFactor,
      intervalDays: result.intervalDays,
      repetitions: result.repetitions,
      dueAt: result.dueAt,
      lastReviewedAt: now,
    })
    .where(eq(vocabCards.id, cardId))
    .returning();

  const row = updated[0];

  await db.insert(reviewLog).values({
    cardId,
    reviewedAt: now,
    grade: result.quality,
    intervalBefore,
    intervalAfter: result.intervalDays,
  });

  return NextResponse.json({ ...row, status: computeVocabStatus(row) });
}
