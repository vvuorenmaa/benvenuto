"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { ContextPanel } from "@/components/ContextPanel";
import { MODES, type Mode } from "@/lib/prompts";

export default function Home() {
  const [activeMode, setActiveMode] = useState<Mode>("grammar");
  const [latestAssistantText, setLatestAssistantText] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [sessionStartedAt] = useState(() => Date.now());

  return (
    <div className="flex flex-1 min-h-0">
      <div className="flex flex-1 min-w-0 flex-col min-h-0">
        <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-8">
          <div className="flex justify-center">
            <nav
              className="inline-flex max-w-full gap-1 overflow-x-auto rounded-lg bg-zinc-100 dark:bg-zinc-900 p-2"
            >
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
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
