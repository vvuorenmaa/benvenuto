"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { StatTile } from "@/components/StatTile";
import { findMatchingGrammarTopic } from "@/lib/grammar/search";

type VocabCardLite = {
  id: number;
  italian: string;
  createdAt: number;
};

type ContextPanelProps = {
  sessionStartedAt: number;
  refetchTrigger: number;
  latestAssistantText: string | null;
};

function NewWordsSection({
  sessionStartedAt,
  refetchTrigger,
}: {
  sessionStartedAt: number;
  refetchTrigger: number;
}) {
  const [newWords, setNewWords] = useState<VocabCardLite[]>([]);
  const isFirstTrigger = useRef(true);

  // Alkulataus mountissa.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/vocab");
        if (!res.ok) return;
        const data: VocabCardLite[] = await res.json();
        if (!cancelled) {
          setNewWords(data.filter((card) => card.createdAt >= sessionStartedAt));
        }
      } catch {
        // hiljainen epäonnistuminen — osio näyttää vain 0
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // sessionStartedAt on vakio istunnon ajan (ref-arvo), riittää mount-latauksena.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch kun assistentin vastaus valmistuu (annetaan palvelimen after()-hookille aikaa).
  useEffect(() => {
    if (isFirstTrigger.current) {
      isFirstTrigger.current = false;
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/vocab");
        if (!res.ok) return;
        const data: VocabCardLite[] = await res.json();
        if (!cancelled) {
          setNewWords(data.filter((card) => card.createdAt >= sessionStartedAt));
        }
      } catch {
        // hiljainen epäonnistuminen
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchTrigger]);

  return (
    <div>
      <StatTile value={newWords.length} label="Uusia sanoja" />
      {newWords.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {newWords.slice(0, 5).map((card) => (
            <li key={card.id} className="text-sm text-neutral-700 dark:text-neutral-300">
              {card.italian}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RelatedGrammarSection({ latestAssistantText }: { latestAssistantText: string | null }) {
  if (!latestAssistantText || !latestAssistantText.trim()) return null;

  const topic = findMatchingGrammarTopic(latestAssistantText);
  if (!topic) return null;

  return (
    <div>
      <p className="text-sm font-semibold mb-2">Liittyvä kielioppi</p>
      <p className="text-sm text-blue-600 dark:text-blue-400">{`→ ${topic.title}`}</p>
      <Link
        href={`/kielioppi/${topic.slug}`}
        className="mt-2 inline-flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      >
        Avaa aihe →
      </Link>
    </div>
  );
}

function ContextPanelContent(props: ContextPanelProps) {
  return (
    <>
      <NewWordsSection
        sessionStartedAt={props.sessionStartedAt}
        refetchTrigger={props.refetchTrigger}
      />
      <RelatedGrammarSection latestAssistantText={props.latestAssistantText} />
    </>
  );
}

export function ContextPanel(props: ContextPanelProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const floatingButtonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const closeSheet = useCallback(() => {
    setIsSheetOpen(false);
    floatingButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isSheetOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeSheet();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    sheetRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSheetOpen, closeSheet]);

  return (
    <>
      {/* Desktop-kontekstipaneeli — vain Keskustelu-näkymässä, vain isoilla näytöillä */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 border-l border-neutral-200 dark:border-neutral-800 p-4 space-y-6 overflow-y-auto">
        <p className="text-sm font-semibold">Tässä keskustelussa</p>
        <ContextPanelContent {...props} />
      </aside>

      {/* Kelluva info-painike kapeilla näytöillä */}
      <button
        ref={floatingButtonRef}
        type="button"
        onClick={() => setIsSheetOpen(true)}
        aria-label="Avaa keskustelun tiedot"
        aria-haspopup="dialog"
        aria-expanded={isSheetOpen}
        className="fixed bottom-36 right-4 md:bottom-24 z-20 rounded-full bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 p-3 shadow-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0ZM9 9a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H10a1 1 0 0 1-1-1Zm0 3a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2H9Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Bottom sheet -vetolaatikko (sama sisältö kuin desktop-paneelissa) */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/20"
            onClick={closeSheet}
            aria-hidden="true"
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Keskustelun tiedot"
            tabIndex={-1}
            className="fixed inset-x-0 bottom-0 rounded-t-2xl border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 max-h-[70vh] overflow-y-auto space-y-6 shadow-lg transition-transform focus:outline-none"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Tässä keskustelussa</p>
              <button
                type="button"
                onClick={closeSheet}
                aria-label="Sulje keskustelun tiedot"
                className="rounded p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ✕
              </button>
            </div>
            <ContextPanelContent {...props} />
          </div>
        </div>
      )}
    </>
  );
}
