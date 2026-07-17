import { NextResponse } from "next/server";
import { z } from "zod";
import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { vocabCards } from "@/lib/db/schema";
import { computeVocabStatus } from "@/lib/vocab/status";

const createVocabSchema = z.object({
  italian: z.string().min(1),
  finnish: z.string().min(1),
  exampleIt: z.string().optional(),
  exampleFi: z.string().optional(),
  context: z.string().optional(),
});

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const q = searchParams.get("q");
  const due = searchParams.get("due") === "true";

  const conditions = [];

  if (q) {
    const pattern = `%${q.toLowerCase()}%`;
    conditions.push(
      or(
        sql`lower(${vocabCards.italian}) like ${pattern}`,
        sql`lower(${vocabCards.finnish}) like ${pattern}`,
        sql`lower(${vocabCards.context}) like ${pattern}`,
      ),
    );
  }

  if (due) {
    conditions.push(eq(vocabCards.suspended, 0));
    conditions.push(sql`${vocabCards.dueAt} <= ${Date.now()}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const orderClause = due ? asc(vocabCards.dueAt) : desc(vocabCards.createdAt);

  const rows = await db.select().from(vocabCards).where(whereClause).orderBy(orderClause);

  const result = rows.map((row) => ({ ...row, status: computeVocabStatus(row) }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createVocabSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const now = Date.now();
  const { italian, finnish, exampleIt, exampleFi, context } = parsed.data;

  const inserted = await db
    .insert(vocabCards)
    .values({
      italian,
      finnish,
      exampleIt: exampleIt ?? null,
      exampleFi: exampleFi ?? null,
      context: context ?? null,
      sourceMode: null,
      sourceMessageId: null,
      grammarTopicSlug: null,
      createdAt: now,
      easeFactor: 2.5,
      intervalDays: 0,
      repetitions: 0,
      dueAt: now,
      lastReviewedAt: null,
      suspended: 0,
    })
    .returning();

  const row = inserted[0];

  return NextResponse.json({ ...row, status: computeVocabStatus(row) }, { status: 201 });
}
