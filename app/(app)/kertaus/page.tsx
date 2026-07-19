"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PartyPopper, CheckCircle2, Check, X } from "lucide-react";
import { StatTile } from "@/components/StatTile";
import { MicButton } from "@/components/MicButton";

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

type Phase = "loading" | "start" | "answering" | "checking" | "revealed" | "done";
type Grade = "hard" | "good" | "easy";

type CheckResult = {
  correct: boolean;
  correctAnswer: string;
  feedback: string;
};

type ReviewStats = {
  todayCount: number;
  weekCount: number;
  successRate: number | null;
};

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
  const [answerInput, setAnswerInput] = useState("");
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [stats, setStats] = useState<ReviewStats>({
    todayCount: 0,
    weekCount: 0,
    successRate: null,
  });
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Kortin vaihtuessa (uusi kortti tai vastauksen paljastus) fokus siirretään
    // näkyvissä olevaan ensisijaiseen elementtiin, koska edellinen elementti (esim.
    // "Tarkista"-nappi) saattaa kadota DOM:sta eikä selain löydä sille luonnollista
    // fokuskohdetta.
    if (phase === "answering") {
      answerInputRef.current?.focus();
    } else if (phase === "revealed") {
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
    let cancelled = false;

    async function loadStats() {
      try {
        const res = await fetch("/api/vocab/review-stats");
        if (!res.ok) throw new Error("Tilastojen lataus epäonnistui");
        const data: ReviewStats = await res.json();
        if (!cancelled) {
          setStats(data);
        }
      } catch {
        // Toissijainen tieto — epäonnistuessa näytetään vain oletusarvot hiljaisesti.
      }
    }

    loadStats();
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
    setAnswerInput("");
    setCheckResult(null);
    setSubmittedAnswer("");
    setPhase("answering");
  }

  async function handleCheckAnswer() {
    const card = cards[currentIndex];
    const answer = answerInput.trim();
    if (!card || !answer) return;

    setSubmittedAnswer(answer);
    setPhase("checking");

    try {
      const res = await fetch("/api/vocab/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, answer }),
      });
      if (!res.ok) throw new Error("Tarkistus epäonnistui");
      const result: CheckResult = await res.json();
      setCheckResult(result);
      setPhase("revealed");
    } catch (err) {
      console.error("Vastauksen tarkistus epäonnistui:", err);
      // Ei jätetä käyttäjää jumiin: näytetään kortti oikeana vastauksena ilman
      // arviointia, jotta kertausta voi jatkaa vaikka tarkistus-API epäonnistuisi.
      setCheckResult({
        correct: false,
        correctAnswer: card.finnish,
        feedback: "Tarkistus ei onnistunut juuri nyt, mutta tässä oikea vastaus.",
      });
      setPhase("revealed");
    }
  }

  function handleDontKnow() {
    const card = cards[currentIndex];
    if (!card) return;

    setSubmittedAnswer(answerInput.trim());
    setCheckResult({
      correct: false,
      correctAnswer: card.finnish,
      feedback: "Ei haittaa — tästä opit!",
    });
    setPhase("revealed");
  }

  function handleNextCard() {
    const card = cards[currentIndex];
    const grade: Grade = checkResult?.correct ? "good" : "hard";

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

    setAnswerInput("");
    setCheckResult(null);
    setSubmittedAnswer("");

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((i) => i + 1);
      setPhase("answering");
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

          <div className="grid w-full grid-cols-3 gap-2">
            <StatTile value={stats.todayCount} label="Tänään" />
            <StatTile value={stats.weekCount} label="Tällä viikolla" />
            <StatTile
              value={stats.successRate !== null ? `${stats.successRate}%` : "–"}
              label="Onnistuminen"
            />
          </div>

          <p className="text-sm text-zinc-500 max-w-xs">
            Kertaus on aktiivista tuottamista: kirjoita tai sano suomennos ääneen ennen
            kuin näet oikean vastauksen. Järjestelmä tarkistaa vastauksesi puolestasi.
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
                Kirjoita tai sano suomennos jokaiselle sanalle — järjestelmä tarkistaa
                vastauksesi automaattisesti ja päättää sen perusteella kertausvälin.
                Oikein menneet sanat palaavat harvemmin, väärin menneet useammin. Näin
                aikasi käytetään juuri niihin sanoihin joita eniten tarvitset harjoitella.
              </p>
            )}
          </div>
        </div>
      )}

      {(phase === "answering" || phase === "checking" || phase === "revealed") &&
        currentCard && (
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

            {phase === "answering" && (
              <p className="text-xs text-zinc-500">Kirjoita tai sano suomennos</p>
            )}

            <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center gap-4 text-center">
              <p className="text-2xl font-semibold">{currentCard.italian}</p>

              {(phase === "checking" || phase === "revealed") && (
                <div role="status" aria-live="polite" className="contents">
                  {phase === "checking" && (
                    <p className="text-sm text-zinc-400 animate-pulse motion-reduce:animate-none">
                      Tarkistetaan...
                    </p>
                  )}

                  {phase === "revealed" && checkResult && (
                    <>
                      <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                      <div
                        className={
                          checkResult.correct
                            ? "flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                            : "flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400"
                        }
                      >
                        {checkResult.correct ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <X className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span>{checkResult.correct ? "Oikein!" : "Väärin"}</span>
                      </div>
                      {submittedAnswer && (
                        <p className="text-xs text-zinc-500">
                          Vastasit: {submittedAnswer}
                        </p>
                      )}
                      <p className="text-base text-zinc-700 dark:text-zinc-300">
                        {currentCard.finnish}
                      </p>
                      <p className="text-sm text-zinc-500">{checkResult.feedback}</p>
                      {currentCard.exampleIt && (
                        <div className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900 p-3 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                          <p className="italic">{currentCard.exampleIt}</p>
                          {currentCard.exampleFi && <p>{currentCard.exampleFi}</p>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {(phase === "answering" || phase === "checking") && (
              <div className="flex w-full flex-col items-center gap-2">
                <div className="flex w-full items-center gap-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-2 focus-within:ring-1 focus-within:ring-zinc-300 dark:focus-within:ring-zinc-700">
                  <MicButton
                    onTranscript={(text) =>
                      setAnswerInput((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
                    }
                    disabled={phase === "checking"}
                  />
                  <input
                    ref={answerInputRef}
                    type="text"
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (answerInput.trim() && phase !== "checking") {
                          void handleCheckAnswer();
                        }
                      }
                    }}
                    disabled={phase === "checking"}
                    aria-label="Vastauksesi suomeksi"
                    placeholder="Vastauksesi..."
                    className="flex-1 border-none bg-transparent px-2 py-1.5 text-sm focus:outline-none focus:ring-0 disabled:opacity-60"
                  />
                  <button
                    onClick={() => void handleCheckAnswer()}
                    disabled={!answerInput.trim() || phase === "checking"}
                    className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tarkista
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDontKnow}
                  disabled={phase === "checking"}
                  className="text-xs text-zinc-500 hover:underline rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  En tiedä / Näytä vastaus
                </button>
              </div>
            )}

            {phase === "revealed" && (
              <button
                ref={primaryButtonRef}
                onClick={handleNextCard}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Seuraava kortti
              </button>
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
