import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MODES } from "@/lib/prompts";

type SessionMessage = {
  id: number;
  role: string;
  content: string;
  createdAt: number;
};

type SessionDetail = {
  mode: string;
  messages: SessionMessage[];
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

export default async function KeskusteluPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/chat/sessions/${encodeURIComponent(sessionId)}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error("Keskustelun lataus epäonnistui");
  }

  const data: SessionDetail = await res.json();
  const startedAt = data.messages[0]?.createdAt;

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <header className="border-b border-stone-200 dark:border-stone-800 px-6 py-5 space-y-2">
        <Link
          href="/keskustelut"
          className="inline-flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400 hover:underline rounded focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          ← Takaisin historiaan
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold">{modeLabel(data.mode)}</h1>
          {startedAt !== undefined && (
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {formatStartedAt(startedAt)}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-4">
        {data.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              aria-label={message.role === "user" ? "Oma viesti" : "Opettajan viesti"}
              className={`max-w-[80%] rounded-3xl px-6 py-4 text-sm leading-relaxed whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-green-700 text-white"
                  : "bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
