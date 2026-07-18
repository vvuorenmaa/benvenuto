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
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-400 text-center mt-10">
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
                className={`rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-sm"
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
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
              …
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-neutral-200 dark:border-neutral-800 p-4"
      >
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
          className="flex-1 resize-none rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim()}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Lähetä
        </button>
      </form>
    </div>
  );
}
