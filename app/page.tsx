"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { MODES, type Mode } from "@/lib/prompts";

export default function Home() {
  const [activeMode, setActiveMode] = useState<Mode>("grammar");

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-4">
        <h1 className="text-lg font-semibold mb-3">Benvenuto</h1>
        <nav className="flex gap-2">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              title={mode.description}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
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

      <ChatPanel mode={activeMode} key={activeMode} />
    </div>
  );
}
