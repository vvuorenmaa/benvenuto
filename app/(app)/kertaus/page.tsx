"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { StatTile } from "@/components/StatTile";

type VocabStatus = "new" | "due" | "learned";

type VocabCard = {
  id: number;
  italian: string;
  finnish: string;
  exampleIt: string | null;
  exampleFi: string | null;
  context: string | null;
  sourceMode: string | null;
  dueAt: number;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  suspended: number;
  status: VocabStatus;
};

type Phase = "loading" | "start" | "front" | "revealed" | "done";
type Grade = "hard" | "good" | "easy";

export default function KertausPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(false);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Kortin vaihtuessa (uusi kortti tai vastauksen paljastus) fokus siirretään
    // näkyvissä olevaan ensisijaiseen nappiin, koska edellinen nappi (esim.
    // "Näytä vastaus") katoaa DOM:sta eikä selain löydä sille luonnollista
    // fokuskohdetta.
    if (phase === "front" || phase === "revealed") {
      primaryButtonRef.current?.focus();
    }
  }, [phase, currentIndex]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/vocab?due=true");
        if (!res.ok) throw new Error("Kertauksen lataus epäonnistui");
        const data: VocabCard[] = await res.json();
        if (!cancelled) {
          setCards(data);
          setPhase("start");
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setPhase("start");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentCard = cards[currentIndex];

  function handleStart() {
    setCurrentIndex(0);
    setPhase("front");
  }

  function handleGrade(grade: Grade) {
    const card = cards[currentIndex];

    if (card) {
      fetch("/api/vocab/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, grade }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Arvion tallennus epäonnistui");
        })
        .catch((err) => {
          console.error("Kertausarvion tallennus epäonnistui:", err);
        });
    }

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((i) => i + 1);
      setPhase("front");
    } else {
      setPhase("done");
    }
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 items-center justify-center px-4 py-8">
      {phase === "loading" && (
        <p role="status" aria-live="polite" className="text-sm text-neutral-400">
          Ladataan kertausta...
        </p>
      )}

      {phase === "start" && error && (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-neutral-400 text-center max-w-sm"
        >
          Kertauksen lataus epäonnistui. Yritä päivittää sivu.
        </p>
      )}

      {phase === "start" && !error && cards.length === 0 && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-4 text-center max-w-sm"
        >
          <p className="text-lg font-semibold">
            Ei kertausta juuri nyt — kaikki ajan tasalla! 🎉
          </p>
          <Link
            href="/sanasto"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Takaisin sanastoon
          </Link>
        </div>
      )}

      {phase === "start" && !error && cards.length > 0 && (
        <div className="flex flex-col items-center gap-6 text-center">
          <div>
            <p className="text-lg font-semibold">Tämän päivän kertaus</p>
            <p className="text-sm text-neutral-500 mt-1">
              <span className="font-mono">{cards.length}</span> sanaa odottaa kertausta
            </p>
          </div>
          <button
            onClick={handleStart}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Aloita kertaus
          </button>
        </div>
      )}

      {(phase === "front" || phase === "revealed") && currentCard && (
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center gap-2">
            <p className="text-sm text-neutral-500">
              <span className="font-mono">
                {currentIndex + 1} / {cards.length}
              </span>
            </p>
            <div
              className="flex w-full gap-1"
              role="progressbar"
              aria-valuenow={currentIndex + 1}
              aria-valuemin={1}
              aria-valuemax={cards.length}
              aria-label="Kertauksen edistyminen"
            >
              {cards.map((_, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className={
                    i <= currentIndex
                      ? "h-1.5 flex-1 rounded-full bg-blue-600"
                      : "h-1.5 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-800"
                  }
                />
              ))}
            </div>
          </div>

          <div
            role="status"
            aria-live="polite"
            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 flex flex-col items-center gap-4 text-center"
          >
            <p className="text-2xl font-semibold">{currentCard.italian}</p>

            {phase === "revealed" && (
              <>
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                <p className="text-base text-neutral-700 dark:text-neutral-300">
                  {currentCard.finnish}
                </p>
                {currentCard.exampleIt && (
                  <div className="w-full rounded-xl bg-neutral-50 dark:bg-neutral-900 p-3 text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                    <p className="italic">{currentCard.exampleIt}</p>
                    {currentCard.exampleFi && <p>{currentCard.exampleFi}</p>}
                  </div>
                )}
              </>
            )}
          </div>

          {phase === "front" && (
            <button
              ref={primaryButtonRef}
              onClick={() => setPhase("revealed")}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Näytä vastaus
            </button>
          )}

          {phase === "revealed" && (
            <div className="flex w-full gap-2">
              <button
                onClick={() => handleGrade("hard")}
                className="flex-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Vaikea
              </button>
              <button
                ref={primaryButtonRef}
                onClick={() => handleGrade("good")}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Hyvä
              </button>
              <button
                onClick={() => handleGrade("easy")}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Helppo
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "done" && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-4 text-center"
        >
          <p className="text-lg font-semibold">Kertaus valmis! ✅</p>
          <StatTile value={`${cards.length} / ${cards.length}`} label="käyty läpi" />
          <div className="flex gap-3 mt-2">
            <Link
              href="/sanasto"
              className="rounded-xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Takaisin sanastoon
            </Link>
            <Link
              href="/"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Chattiin
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
