import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { messages as messagesTable } from "@/lib/db/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  const rows = await db
    .select({
      id: messagesTable.id,
      role: messagesTable.role,
      content: messagesTable.content,
      createdAt: messagesTable.createdAt,
      mode: messagesTable.mode,
    })
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(asc(messagesTable.createdAt));

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const mode = rows[0].mode;
  const result = rows.map(({ id, role, content, createdAt }) => ({ id, role, content, createdAt }));

  return NextResponse.json({ mode, messages: result });
}
