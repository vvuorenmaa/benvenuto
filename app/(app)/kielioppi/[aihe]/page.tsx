import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { vocabCards } from "@/lib/db/schema";
import { getGrammarTopicBySlug } from "@/lib/grammar/search";
import type { GrammarTopic } from "@/lib/grammar/topics";
import { GrammarQuiz } from "@/components/GrammarQuiz";

const CATEGORY_LABELS: Record<GrammarTopic["category"], string> = {
  aikamuodot: "Aikamuodot",
  pronominit: "Pronominit",
  säännöt: "Säännöt",
  ääntäminen: "Ääntäminen",
};

export default async function GrammarTopicPage({
  params,
}: {
  params: Promise<{ aihe: string }>;
}) {
  const { aihe } = await params;
  const topic = getGrammarTopicBySlug(aihe);

  if (!topic) {
    notFound();
  }

  const relatedCards = await db
    .select()
    .from(vocabCards)
    .where(eq(vocabCards.grammarTopicSlug, aihe));

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Link
            href="/kielioppi"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            ← Kielioppikirjasto
          </Link>

          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {topic.title}
            </h1>
            <span className="shrink-0 inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-300">
              {CATEGORY_LABELS[topic.category]}
            </span>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{topic.bodyMd}</ReactMarkdown>
          </div>

          {relatedCards.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Liittyvät sanat sanavarastossasi
              </h2>
              <div className="flex flex-wrap gap-2">
                {relatedCards.map((card) => (
                  <Link
                    key={card.id}
                    href="/sanasto"
                    aria-label={`Avaa sanasto — liittyvä sana: ${card.italian}`}
                    className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    {card.italian}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {topic.quiz && <GrammarQuiz questions={topic.quiz} />}
        </div>
      </div>
    </div>
  );
}
