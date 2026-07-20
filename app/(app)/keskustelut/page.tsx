import Link from "next/link";
import { headers } from "next/headers";
import { MODES } from "@/lib/prompts";

type SessionSummary = {
  sessionId: string;
  mode: string;
  startedAt: number;
  preview: string;
};

async function getBaseUrl(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

function modeLabel(mode: string): string {
  return MODES.find((m) => m.id === mode)?.label ?? mode;
}

function formatStartedAt(startedAt: number): string {
  return new Date(startedAt).toLocaleString("fi-FI", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function KeskustelutPage() {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/chat/sessions`, { cache: "no-store" });
  const sessions: SessionSummary[] = res.ok ? await res.json() : [];

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <header className="border-b border-stone-200 dark:border-stone-800 px-4 py-5">
        <h1 className="text-lg font-semibold">Keskusteluhistoria</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Selaa aiempia keskustelujasi.
        </p>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        {sessions.length === 0 ? (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-stone-400 text-center mt-10"
          >
            Ei vielä tallennettuja keskusteluja.
          </p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li key={session.sessionId}>
                <Link
                  href={`/keskustelut/${session.sessionId}`}
                  className="block rounded-xl border border-stone-200 dark:border-stone-800 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:text-stone-300">
                      {modeLabel(session.mode)}
                    </span>
                    <span className="shrink-0 text-xs text-stone-500 dark:text-stone-400">
                      {formatStartedAt(session.startedAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-700 dark:text-stone-300 line-clamp-2">
                    {session.preview || "(Ei esikatselua)"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
