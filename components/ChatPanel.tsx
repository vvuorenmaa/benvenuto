"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { UIMessage } from "ai";
import type { Mode } from "@/lib/prompts";
import { GrammarTopicLink } from "@/components/GrammarTopicLink";
import { MicButton } from "@/components/MicButton";
import { AudioPlayButton } from "@/components/AudioPlayButton";
import { ArrowUp } from "lucide-react";

function extractPlainText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatPanel({
  mode,
  onAssistantMessage,
}: {
  mode: Mode;
  onAssistantMessage?: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const notifiedMessageId = useRef<string | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { mode },
      }),
    [mode],
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status !== "ready" || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant") return;
    if (notifiedMessageId.current === lastMessage.id) return;

    notifiedMessageId.current = lastMessage.id;
    onAssistantMessage?.(extractPlainText(lastMessage));
  }, [messages, status, onAssistantMessage]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isBusy) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-zinc-400 text-center mt-10">
            Aloita kirjoittamalla viesti alla olevaan kenttään.
          </p>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex max-w-[80%] flex-col gap-1 ${
                message.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`rounded-3xl px-6 py-4 text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex justify-end mb-1">
                    <AudioPlayButton
                      text={extractPlainText(message)}
                      messageId={message.id}
                    />
                  </div>
                )}
                {message.parts.map((part, i) =>
                  part.type === "text" ? (
                    <div key={i} className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
                    </div>
                  ) : null,
                )}
              </div>

              {message.role === "assistant" && (
                <GrammarTopicLink text={extractPlainText(message)} />
              )}
            </div>
          </div>
        ))}

        {status === "submitted" && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-3xl px-6 py-4 text-sm bg-zinc-100 dark:bg-zinc-900 text-zinc-400">
              …
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-2 focus-within:ring-1 focus-within:ring-zinc-300 dark:focus-within:ring-zinc-700">
          <MicButton
            onTranscript={(text) =>
              setInput((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
            }
            onRecordingChange={setIsRecording}
            disabled={isBusy}
          />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={isRecording ? "Kuuntelen..." : "Kirjoita viestisi..."}
            rows={1}
            className="flex-1 resize-none border-none bg-transparent px-2 py-1.5 text-sm focus:outline-none focus:ring-0"
          />
          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            aria-label="Lähetä"
            title="Lähetä"
            className={`flex shrink-0 items-center justify-center rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed ${
              input.trim()
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "text-zinc-400 dark:text-zinc-600"
            }`}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}
