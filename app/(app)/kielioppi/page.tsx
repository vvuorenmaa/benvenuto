"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getGrammarTopicsByCategory, searchGrammarTopics } from "@/lib/grammar/search";
import type { GrammarTopic } from "@/lib/grammar/topics";

const CATEGORY_LABELS: Record<GrammarTopic["category"], string> = {
  aikamuodot: "Aikamuodot",
  pronominit: "Pronominit",
  säännöt: "Säännöt",
  ääntäminen: "Ääntäminen",
};

const CATEGORY_ORDER: GrammarTopic["category"][] = [
  "aikamuodot",
  "pronominit",
  "säännöt",
  "ääntäminen",
];

function TopicBadge({ category }: { category: GrammarTopic["category"] }) {
  return (
    <span className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs text-neutral-600 dark:text-neutral-300">
      {CATEGORY_LABELS[category]}
    </span>
  );
}

function TopicRow({ topic }: { topic: GrammarTopic }) {
  return (
    <li>
      <Link
        href={`/kielioppi/${topic.slug}`}
        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {topic.title}
        </span>
        <TopicBadge category={topic.category} />
      </Link>
    </li>
  );
}

export default function KielioppiPage() {
  const [query, setQuery] = useState("");

  const categorized = useMemo(() => getGrammarTopicsByCategory(), []);

  const searchResults = useMemo(() => {
    if (query.trim().length === 0) return null;
    return searchGrammarTopics(query);
  }, [query]);

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-4 space-y-3">
        <h1 className="text-lg font-semibold">Kielioppikirjasto</h1>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hae kielioppiaihetta..."
          aria-label="Etsi kielioppiaihetta"
          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        {searchResults !== null && (
          <>
            {searchResults.length === 0 ? (
              <p
                role="status"
                aria-live="polite"
                className="text-sm text-neutral-400 text-center mt-10"
              >
                Ei kielioppiaiheita haulla &quot;{query.trim()}&quot;.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {searchResults.map((topic) => (
                  <TopicRow key={topic.slug} topic={topic} />
                ))}
              </ul>
            )}
          </>
        )}

        {searchResults === null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORY_ORDER.map((category) => {
              const topics = categorized[category];
              return (
                <section key={category} className="min-w-0">
                  <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  {topics.length === 0 ? (
                    <p
                      role="status"
                      aria-live="polite"
                      className="text-xs text-neutral-400 dark:text-neutral-500"
                    >
                      Ei vielä aiheita
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {topics.map((topic) => (
                        <li key={topic.slug}>
                          <Link
                            href={`/kielioppi/${topic.slug}`}
                            className="block rounded-lg px-2 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          >
                            {topic.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
