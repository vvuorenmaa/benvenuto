"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { StatTile } from "@/components/StatTile";
import type { QuizQuestion } from "@/lib/grammar/topics";

type Phase = "question" | "answered" | "done";

export function GrammarQuiz({ questions }: { questions: QuizQuestion[] }) {
  const [phase, setPhase] = useState<Phase>("question");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (phase === "question") {
      optionRefs.current[0]?.focus();
    }
  }, [currentIndex, phase]);

  function handleSelectOption(index: number) {
    if (phase !== "question" || !currentQuestion) return;

    setSelectedIndex(index);
    setPhase("answered");
    if (index === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    setSelectedIndex(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setPhase("question");
    } else {
      setPhase("done");
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setScore(0);
    setSelectedIndex(null);
    setPhase("question");
  }

  if (!currentQuestion) return null;

  const isCorrect = selectedIndex !== null && selectedIndex === currentQuestion.correctIndex;
  const isLastQuestion = currentIndex + 1 === questions.length;

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
        Testaa ymmärryksesi
      </h2>

      {(phase === "question" || phase === "answered") && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500">
            Kysymys{" "}
            <span className="font-mono">
              {currentIndex + 1} / {questions.length}
            </span>
          </p>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
            <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
              {currentQuestion.question}
            </p>

            <div className="flex flex-col gap-2">
              {currentQuestion.options.map((option, index) => {
                let stateClasses =
                  "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800";

                if (phase === "answered") {
                  if (index === currentQuestion.correctIndex) {
                    stateClasses = "border-transparent bg-emerald-700 text-white";
                  } else if (index === selectedIndex) {
                    stateClasses = "border-transparent bg-red-600 text-white";
                  } else {
                    stateClasses = "border-zinc-200 dark:border-zinc-800 opacity-60";
                  }
                }

                return (
                  <button
                    key={index}
                    ref={(el) => {
                      optionRefs.current[index] = el;
                    }}
                    type="button"
                    onClick={() => handleSelectOption(index)}
                    disabled={phase === "answered"}
                    className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed ${stateClasses}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {phase === "answered" && (
              <div role="status" aria-live="polite" className="contents">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                <div
                  className={
                    isCorrect
                      ? "flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                      : "flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400"
                  }
                >
                  {isCorrect ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <X className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>{isCorrect ? "Oikein!" : "Väärin"}</span>
                </div>
                <p className="text-sm text-zinc-500">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          {phase === "answered" && (
            <button
              type="button"
              onClick={handleNext}
              className="self-start rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {isLastQuestion ? "Näytä tulos" : "Seuraava kysymys"}
            </button>
          )}
        </div>
      )}

      {phase === "done" && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-4 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6"
        >
          <StatTile value={`${score} / ${questions.length}`} label="Oikein" />
          <p className="text-sm text-zinc-500">
            {score === questions.length
              ? "Täydellistä! Hallitset tämän aiheen erinomaisesti."
              : "Hyvää työtä — voit yrittää uudelleen kerrataksesi aihetta."}
          </p>
          <button
            type="button"
            onClick={handleRestart}
            className="rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Yritä uudelleen
          </button>
        </div>
      )}
    </div>
  );
}
