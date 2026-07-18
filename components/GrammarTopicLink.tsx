"use client";

import Link from "next/link";
import { findMatchingGrammarTopic } from "@/lib/grammar/search";

export function GrammarTopicLink({ text }: { text: string }) {
  const topic = findMatchingGrammarTopic(text);

  if (!topic) {
    return null;
  }

  return (
    <Link
      href={`/kielioppi/${topic.slug}`}
      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
    >
      {`→ ${topic.title}`}
    </Link>
  );
}
