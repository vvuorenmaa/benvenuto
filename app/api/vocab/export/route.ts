import { db } from "@/lib/db/client";
import { vocabCards } from "@/lib/db/schema";
import { computeVocabStatus } from "@/lib/vocab/status";

function csvEscape(value: string | null): string {
  const v = value ?? "";
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

const CSV_HEADER = [
  "italian",
  "finnish",
  "exampleIt",
  "exampleFi",
  "context",
  "sourceMode",
  "createdAt",
  "status",
].join(",");

export async function GET() {
  const rows = await db.select().from(vocabCards);

  const lines = rows.map((row) => {
    const status = computeVocabStatus(row);
    return [
      csvEscape(row.italian),
      csvEscape(row.finnish),
      csvEscape(row.exampleIt),
      csvEscape(row.exampleFi),
      csvEscape(row.context),
      csvEscape(row.sourceMode),
      csvEscape(new Date(row.createdAt).toISOString()),
      csvEscape(status),
    ].join(",");
  });

  const csvContent = [CSV_HEADER, ...lines].join("\n");

  const today = new Date().toISOString().slice(0, 10);

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="benvenuto-sanasto-${today}.csv"`,
    },
  });
}
