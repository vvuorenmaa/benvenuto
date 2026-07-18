import { GRAMMAR_TOPICS, type GrammarTopic } from "./topics";

const GRAMMAR_CATEGORIES: GrammarTopic["category"][] = [
  "aikamuodot",
  "pronominit",
  "säännöt",
  "ääntäminen",
];

export function searchGrammarTopics(query: string): GrammarTopic[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return GRAMMAR_TOPICS;
  }

  return GRAMMAR_TOPICS.filter((topic) => {
    if (topic.title.toLowerCase().includes(normalizedQuery)) return true;
    if (topic.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))) return true;
    if (topic.bodyMd.toLowerCase().includes(normalizedQuery)) return true;
    return false;
  });
}

export function getGrammarTopicsByCategory(): Record<GrammarTopic["category"], GrammarTopic[]> {
  const grouped = Object.fromEntries(
    GRAMMAR_CATEGORIES.map((category) => [category, [] as GrammarTopic[]]),
  ) as Record<GrammarTopic["category"], GrammarTopic[]>;

  for (const topic of GRAMMAR_TOPICS) {
    grouped[topic.category].push(topic);
  }

  return grouped;
}

export function getGrammarTopicBySlug(slug: string): GrammarTopic | undefined {
  return GRAMMAR_TOPICS.find((topic) => topic.slug === slug);
}
