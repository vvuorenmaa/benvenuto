import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";

const PREVIEW_MAX_LENGTH = 80;

type SessionRow = {
  sessionId: string;
  mode: string;
  startedAt: number;
  previewRaw: string | null;
};

function buildPreview(previewRaw: string | null): string {
  if (!previewRaw) return "";
  if (previewRaw.length <= PREVIEW_MAX_LENGTH) return previewRaw;
  return `${previewRaw.slice(0, PREVIEW_MAX_LENGTH)}...`;
}

export async function GET() {
  const rows = db.all<SessionRow>(sql`
    SELECT
      m.session_id AS sessionId,
      (SELECT m2.mode FROM messages m2 WHERE m2.session_id = m.session_id LIMIT 1) AS mode,
      MIN(m.created_at) AS startedAt,
      (
        SELECT m3.content
        FROM messages m3
        WHERE m3.session_id = m.session_id AND m3.role = 'user'
        ORDER BY m3.created_at ASC
        LIMIT 1
      ) AS previewRaw
    FROM messages m
    WHERE m.session_id IS NOT NULL
    GROUP BY m.session_id
    ORDER BY startedAt DESC
  `);

  const result = rows.map((row) => ({
    sessionId: row.sessionId,
    mode: row.mode,
    startedAt: row.startedAt,
    preview: buildPreview(row.previewRaw),
  }));

  return NextResponse.json(result);
}
