import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { vocabCards } from "@/lib/db/schema";
import { computeVocabStatus } from "@/lib/vocab/status";

const updateVocabSchema = z.object({
  italian: z.string().min(1).optional(),
  finnish: z.string().min(1).optional(),
  exampleIt: z.string().optional(),
  exampleFi: z.string().optional(),
  context: z.string().optional(),
  suspended: z
    .union([z.boolean(), z.literal(0), z.literal(1)])
    .optional(),
});

function parseId(id: string): number | null {
  const parsed = Number(id);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = parseId(idParam);

  if (id === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = updateVocabSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { suspended, ...rest } = parsed.data;

  const updates: Partial<typeof vocabCards.$inferInsert> = { ...rest };

  if (suspended !== undefined) {
    updates.suspended = suspended === true || suspended === 1 ? 1 : 0;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await db
    .update(vocabCards)
    .set(updates)
    .where(eq(vocabCards.id, id))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = updated[0];

  return NextResponse.json({ ...row, status: computeVocabStatus(row) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = parseId(idParam);

  if (id === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const deleted = await db.delete(vocabCards).where(eq(vocabCards.id, id)).returning();

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
