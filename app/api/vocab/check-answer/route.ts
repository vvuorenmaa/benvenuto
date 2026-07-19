import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { vocabCards } from "@/lib/db/schema";
import { checkAnswer } from "@/lib/checking/checkAnswer";

const checkAnswerSchema = z.object({
  cardId: z.number().int(),
  answer: z.string(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = checkAnswerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { cardId, answer } = parsed.data;

  const existing = await db
    .select()
    .from(vocabCards)
    .where(eq(vocabCards.id, cardId));

  const card = existing[0];

  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await checkAnswer({
    italian: card.italian,
    correctFinnish: card.finnish,
    userAnswer: answer,
  });

  return NextResponse.json({
    correct: result.correct,
    correctAnswer: card.finnish,
    feedback: result.feedback,
  });
}
