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
        <header className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-4">
          <h1 className="text-lg font-semibold mb-3">Benvenuto</h1>
          <nav className="flex gap-2 overflow-x-auto">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                title={mode.description}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeMode === mode.id
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </nav>
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
