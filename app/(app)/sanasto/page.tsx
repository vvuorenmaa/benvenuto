"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Trash2 } from "lucide-react";
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
  new: { label: "Uusi", dot: "bg-green-600" },
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
      <header className="border-b border-stone-200 dark:border-stone-800 px-4 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Sanasto</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">{cards.length} sanaa</span>
            <a
              href="/api/vocab/export"
              download
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Vie CSV
            </a>
          </div>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hae sana tai lause..."
          aria-label="Etsi sanastosta"
          className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        <nav className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={activeFilter === filter.id}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 ${
                activeFilter === filter.id
                  ? "bg-green-700 text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
              }`}
            >
              {filter.label} · {countFor(filter.id)}
            </button>
          ))}
        </nav>

        {dueCount > 0 && (
          <Link
            href="/kertaus"
            className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            Aloita kertaus ({dueCount} due)
          </Link>
        )}
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading && (
          <p role="status" aria-live="polite" className="text-sm text-stone-400 text-center mt-10">
            Ladataan...
          </p>
        )}

        {!loading && error && (
          <p role="status" aria-live="polite" className="text-sm text-stone-400 text-center mt-10">
            Sanaston lataus epäonnistui. Yritä päivittää sivu.
          </p>
        )}

        {!loading && !error && cards.length === 0 && (
          <p role="status" aria-live="polite" className="text-sm text-stone-400 text-center mt-10">
            Sanasto täyttyy automaattisesti kun keskustelet — aloita chatista.
          </p>
        )}

        {!loading && !error && cards.length > 0 && filteredCards.length === 0 && (
          <p role="status" aria-live="polite" className="text-sm text-stone-400 text-center mt-10">
            Ei sanoja tässä suodattimessa.
          </p>
        )}

        {!loading && !error && filteredCards.length > 0 && (
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {filteredCards.map((card) => {
              const meta = STATUS_META[card.status];
              const tag = sourceLabel(card.sourceMode);
              const isDeleting = deletingIds.has(card.id);

              return (
                <li
                  key={card.id}
                  className="flex items-start justify-between gap-3 px-4 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-stone-900 dark:text-stone-100">
                        {card.italian}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-xs text-stone-600 dark:text-stone-300">
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                      {tag && (
                        <span className="text-xs text-stone-400 dark:text-stone-500">
                          {tag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                      {card.finnish}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(card.id)}
                    disabled={isDeleting}
                    aria-label={`Poista sana ${card.italian}`}
                    title="Poista sana"
                    className="shrink-0 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 disabled:opacity-40 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
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
