"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PartyPopper, CheckCircle2 } from "lucide-react";
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

function formatIntervalFeedback(intervalDays: number): string {
  if (intervalDays <= 0) {
    return "Näet tämän sanan uudelleen pian";
  }
  if (intervalDays === 1) {
    return "Näet tämän sanan uudelleen huomenna";
  }
  return `Näet tämän sanan uudelleen ~${intervalDays} päivän päästä`;
}

export default function KertausPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(false);
  const [isHowOpen, setIsHowOpen] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    // Siivotaan mahdollinen ajastettu palautteen piilotus, jos komponentti
    // puretaan kesken sen odottamisen.
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
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
        .then(async (res) => {
          if (!res.ok) throw new Error("Arvion tallennus epäonnistui");
          const updated: VocabCard = await res.json();

          if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current);
          }
          setLastFeedback(formatIntervalFeedback(updated.intervalDays));
          feedbackTimeoutRef.current = setTimeout(() => {
            setLastFeedback(null);
          }, 2500);
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
    <div className="relative flex flex-1 flex-col min-h-0 items-center justify-center px-4 py-8">
      {lastFeedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-xs font-medium text-white dark:text-zinc-900 shadow-lg transition-opacity"
        >
          {lastFeedback}
        </div>
      )}

      {phase === "loading" && (
        <p role="status" aria-live="polite" className="text-sm text-zinc-400">
          Ladataan kertausta...
        </p>
      )}

      {phase === "start" && error && (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-zinc-400 text-center max-w-sm"
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
          <PartyPopper className="h-8 w-8 text-indigo-500" aria-hidden="true" />
          <p className="text-lg font-semibold">
            Ei kertausta juuri nyt — kaikki ajan tasalla!
          </p>
          <Link
            href="/sanasto"
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Takaisin sanastoon
          </Link>
        </div>
      )}

      {phase === "start" && !error && cards.length > 0 && (
        <div className="flex flex-col items-center gap-6 text-center max-w-sm">
          <div>
            <p className="text-lg font-semibold">Tämän päivän kertaus</p>
            <p className="text-sm text-zinc-500 mt-1">
              <span className="font-mono">{cards.length}</span> sanaa odottaa kertausta
            </p>
          </div>

          <p className="text-sm text-zinc-500 max-w-xs">
            Kertaus on itsetestausta: yritä muistaa suomennos mielessäsi ennen kuin
            paljastat vastauksen. Arvioi sitten rehellisesti, kuinka hyvin muistit.
          </p>

          <button
            onClick={handleStart}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Aloita kertaus
          </button>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHowOpen((open) => !open)}
              aria-expanded={isHowOpen}
              aria-controls="kertaus-how-it-works"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Miten tämä toimii?
            </button>
            {isHowOpen && (
              <p id="kertaus-how-it-works" className="text-xs text-zinc-500 max-w-xs">
                Kertausväli kasvaa sitä mukaa mitä paremmin muistat sanan — helposti
                muistetut sanat palaavat harvemmin, vaikeat useammin. Näin aikasi
                käytetään juuri niihin sanoihin joita eniten tarvitset harjoitella.
              </p>
            )}
          </div>
        </div>
      )}

      {(phase === "front" || phase === "revealed") && currentCard && (
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center gap-2">
            <p className="text-sm text-zinc-500">
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
                      ? "h-1.5 flex-1 rounded-full bg-indigo-600"
                      : "h-1.5 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800"
                  }
                />
              ))}
            </div>
          </div>

          {phase === "front" && (
            <p className="text-xs text-zinc-500">
              Mieti suomennos ennen kuin paljastat sen
            </p>
          )}

          <div
            role="status"
            aria-live="polite"
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center gap-4 text-center"
          >
            <p className="text-2xl font-semibold">{currentCard.italian}</p>

            {phase === "revealed" && (
              <>
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                <p className="text-base text-zinc-700 dark:text-zinc-300">
                  {currentCard.finnish}
                </p>
                {currentCard.exampleIt && (
                  <div className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 p-3 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
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
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Näytä vastaus
            </button>
          )}

          {phase === "revealed" && (
            <div className="flex w-full gap-2">
              <button
                onClick={() => handleGrade("hard")}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Vaikea
                <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400">
                  En muistanut / arvasin
                </span>
              </button>
              <button
                ref={primaryButtonRef}
                onClick={() => handleGrade("good")}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Hyvä
                <span className="text-[10px] font-normal text-indigo-100">
                  Muistin miettimällä
                </span>
              </button>
              <button
                onClick={() => handleGrade("easy")}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Helppo
                <span className="text-[10px] font-normal text-white">
                  Muistin heti
                </span>
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
          <CheckCircle2 className="h-8 w-8 text-emerald-500" aria-hidden="true" />
          <p className="text-lg font-semibold">Kertaus valmis!</p>
          <StatTile value={`${cards.length} / ${cards.length}`} label="käyty läpi" />
          <div className="flex gap-3 mt-2">
            <Link
              href="/sanasto"
              className="rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Takaisin sanastoon
            </Link>
            <Link
              href="/"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Chattiin
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
