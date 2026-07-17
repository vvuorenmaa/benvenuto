"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MODES, type Mode } from "@/lib/prompts";

type VocabStatus = "new" | "due" | "learned";

type VocabCard = {
  id: number;
  italian: string;
  finnish: string;
  exampleIt: string | null;
  exampleFi: string | null;
  context: string | null;
  sourceMode: Mode | null;
  sourceMessageId: number | null;
  grammarTopicSlug: string | null;
  createdAt: number;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueAt: number;
  lastReviewedAt: number | null;
  suspended: number;
  status: VocabStatus;
};

type FilterId = "all" | "due" | "new" | "learned";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Kaikki" },
  { id: "due", label: "Due nyt" },
  { id: "new", label: "Uudet" },
  { id: "learned", label: "Opitut" },
];

const STATUS_META: Record<VocabStatus, { label: string; dot: string }> = {
  new: { label: "Uusi", dot: "bg-blue-500" },
  due: { label: "Due nyt", dot: "bg-amber-500" },
  learned: { label: "Opittu", dot: "bg-emerald-500" },
};

function sourceLabel(sourceMode: Mode | null): string | null {
  if (sourceMode === null) return "Lisätty käsin";
  return MODES.find((m) => m.id === sourceMode)?.label ?? null;
}

export default function SanastoPage() {
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const url = debouncedQuery
          ? `/api/vocab?q=${encodeURIComponent(debouncedQuery)}`
          : "/api/vocab";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Sanaston lataus epäonnistui");
        const data: VocabCard[] = await res.json();
        if (!cancelled) setCards(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  function countFor(id: FilterId): number {
    if (id === "all") return cards.length;
    return cards.filter((c) => c.status === id).length;
  }

  const dueCount = countFor("due");

  const filteredCards =
    activeFilter === "all" ? cards : cards.filter((c) => c.status === activeFilter);

  async function handleDelete(id: number) {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/vocab/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Poisto epäonnistui");
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // jätetään rivi näkyviin, jos poisto epäonnistui
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Sanasto</h1>
          <span className="text-sm text-neutral-500">{cards.length} sanaa</span>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hae sana tai lause..."
          aria-label="Etsi sanastosta"
          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <nav className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={activeFilter === filter.id}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeFilter === filter.id
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {filter.label} · {countFor(filter.id)}
            </button>
          ))}
        </nav>

        {dueCount > 0 && (
          <Link
            href="/kertaus"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Aloita kertaus ({dueCount} due)
          </Link>
        )}
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading && (
          <p role="status" aria-live="polite" className="text-sm text-neutral-400 text-center mt-10">
            Ladataan...
          </p>
        )}

        {!loading && error && (
          <p role="status" aria-live="polite" className="text-sm text-neutral-400 text-center mt-10">
            Sanaston lataus epäonnistui. Yritä päivittää sivu.
          </p>
        )}

        {!loading && !error && cards.length === 0 && (
          <p role="status" aria-live="polite" className="text-sm text-neutral-400 text-center mt-10">
            Sanasto täyttyy automaattisesti kun keskustelet — aloita chatista.
          </p>
        )}

        {!loading && !error && cards.length > 0 && filteredCards.length === 0 && (
          <p role="status" aria-live="polite" className="text-sm text-neutral-400 text-center mt-10">
            Ei sanoja tässä suodattimessa.
          </p>
        )}

        {!loading && !error && filteredCards.length > 0 && (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredCards.map((card) => {
              const meta = STATUS_META[card.status];
              const tag = sourceLabel(card.sourceMode);
              const isDeleting = deletingIds.has(card.id);

              return (
                <li
                  key={card.id}
                  className="flex items-start justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {card.italian}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs text-neutral-600 dark:text-neutral-300">
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                      {tag && (
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">
                          {tag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {card.finnish}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(card.id)}
                    disabled={isDeleting}
                    aria-label={`Poista sana ${card.italian}`}
                    title="Poista sana"
                    className="shrink-0 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 disabled:opacity-40 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.75 1a.75.75 0 0 0-.75.75V2H4a.75.75 0 0 0 0 1.5h.375l.615 11.07A2.25 2.25 0 0 0 7.234 16.6h5.532a2.25 2.25 0 0 0 2.244-2.03L15.625 3.5H16a.75.75 0 0 0 0-1.5h-4v-.25a.75.75 0 0 0-.75-.75h-2.5ZM8.5 6.75a.75.75 0 0 1 1.5 0v6a.75.75 0 0 1-1.5 0v-6Zm3 0a.75.75 0 0 1 1.5 0v6a.75.75 0 0 1-1.5 0v-6Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
