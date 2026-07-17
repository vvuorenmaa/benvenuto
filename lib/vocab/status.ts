export type VocabStatus = "new" | "due" | "learned";

export function computeVocabStatus(
  card: { suspended: number; repetitions: number; dueAt: number },
  now: number = Date.now(),
): VocabStatus {
  if (card.suspended) return "learned";
  if (card.repetitions === 0) return "new";
  if (card.dueAt <= now) return "due";
  return "learned";
}
