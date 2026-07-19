"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { ContextPanel } from "@/components/ContextPanel";
import { MODES, type Mode } from "@/lib/prompts";
import { clearStoredMessages, loadActiveMode, saveActiveMode } from "@/lib/chat/sessionStorage";

export default function Home() {
  const [activeMode, setActiveMode] = useState<Mode>(() => loadActiveMode("grammar"));
  const [latestAssistantText, setLatestAssistantText] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [sessionStartedAt] = useState(() => Date.now());

  function handleModeSelect(nextMode: Mode) {
    if (nextMode === activeMode) return;
    clearStoredMessages(activeMode);
    clearStoredMessages(nextMode);
    saveActiveMode(nextMode);
    setActiveMode(nextMode);
  }

  return (
    <div className="flex flex-1 min-h-0">
      <div className="flex flex-1 min-w-0 flex-col min-h-0">
        <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-8">
          <div className="flex items-center gap-2">
            <div className="flex-1" aria-hidden="true" />

            <nav
              className="min-w-0 max-w-full inline-flex gap-1 overflow-x-auto rounded-lg bg-zinc-100 dark:bg-zinc-900 p-2"
            >
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  title={mode.description}
                  className={`shrink-0 rounded-md px-6 py-2 text-sm font-medium transition-colors ${
                    activeMode === mode.id
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </nav>

            <div className="flex flex-1 justify-end">
              <Link
                href="/keskustelut"
                title="Keskusteluhistoria"
                aria-label="Keskusteluhistoria"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Historia</span>
              </Link>
            </div>
          </div>
        </header>

        <ChatPanel
          mode={activeMode}
          key={activeMode}
          onAssistantMessage={(text) => {
            setLatestAssistantText(text);
            setRefetchTrigger((t) => t + 1);
          }}
        />
      </div>

      <ContextPanel
        sessionStartedAt={sessionStartedAt}
        refetchTrigger={refetchTrigger}
        latestAssistantText={latestAssistantText}
      />
    </div>
  );
}
