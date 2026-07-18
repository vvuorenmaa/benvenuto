/**
 * Pure SRS (Spaced Repetition System) scheduling logic, based on SM-2.
 *
 * IMPORTANT deviation from classic SM-2: this app's review UI (see
 * docs/ux-dashboard-design.md §5) only exposes three grading buttons —
 * "hard" / "good" / "easy" — all of which represent a *successful* recall
 * at different difficulty levels. There is no "again" / failure button, so
 * `repetitions` always increases on every review; it is never reset to 0.
 *
 * This file has no side effects and no DB dependency, making it easy to
 * unit test in isolation.
 */

export type ReviewGrade = "hard" | "good" | "easy";

export type SrsState = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

export type SrsResult = SrsState & { dueAt: number; quality: number };

const GRADE_QUALITY: Record<ReviewGrade, number> = {
  hard: 3,
  good: 4,
  easy: 5,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function computeNextReview(
  state: SrsState,
  grade: ReviewGrade,
  now: number = Date.now(),
): SrsResult {
  const quality = GRADE_QUALITY[grade];

  // Classic SM-2 ease factor update.
  const rawEase =
    state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const newEase = Math.max(1.3, rawEase);

  // Base interval derived from the repetition count. Since repetitions
  // never reset (no failure grade exists in this UI), we only ever move
  // forward through the "learning steps" (1 day, then 6 days) before
  // switching to ease-factor-driven growth.
  let baseInterval: number;
  if (state.repetitions === 0) {
    baseInterval = 1;
  } else if (state.repetitions === 1) {
    baseInterval = 6;
  } else {
    baseInterval = Math.round(state.intervalDays * newEase);
  }

  // App-specific adjustment (NOT part of classic SM-2): the three grading
  // buttons all count as a "pass", but we still want them to visibly affect
  // scheduling, so "hard" shortens the computed interval, "good" leaves it
  // as-is, and "easy" stretches it further.
  let intervalDays: number;
  if (grade === "hard") {
    intervalDays = Math.max(1, Math.round(baseInterval * 0.5));
  } else if (grade === "easy") {
    intervalDays = Math.round(baseInterval * 1.3);
  } else {
    intervalDays = baseInterval;
  }

  const repetitions = state.repetitions + 1;
  const dueAt = now + intervalDays * MS_PER_DAY;

  return { easeFactor: newEase, intervalDays, repetitions, dueAt, quality };
}
