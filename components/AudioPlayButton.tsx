"use client";

import { useCallback, useRef, useState } from "react";

type PlaybackState = "idle" | "loading" | "playing";

// Moduulitason välimuisti (messageId -> Blob-URL). Säilyy koko selainsession
// ajan kaikkien komponentti-instanssien kesken ilman propseja/contextia.
const audioCache = new Map<string, string>();

export function AudioPlayButton({
  text,
  messageId,
}: {
  text: string;
  messageId: string;
}) {
  const [state, setState] = useState<PlaybackState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playUrl = useCallback((url: string) => {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      setState("idle");
    };
    audio.play().catch((error) => {
      console.error("Äänen toisto epäonnistui:", error);
      setState("idle");
    });
    setState("playing");
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState("idle");
  }, []);

  const handleClick = useCallback(async () => {
    if (state === "loading") return;

    if (state === "playing") {
      stopPlayback();
      return;
    }

    const cachedUrl = audioCache.get(messageId);
    if (cachedUrl) {
      playUrl(cachedUrl);
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        console.error("TTS-pyyntö epäonnistui:", res.status, await res.text());
        setState("idle");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioCache.set(messageId, url);
      playUrl(url);
    } catch (error) {
      console.error("Virhe äänen haussa:", error);
      setState("idle");
    }
  }, [state, messageId, text, playUrl, stopPlayback]);

  const isLoading = state === "loading";

  const ariaLabel =
    state === "loading"
      ? "Ladataan ääntä..."
      : state === "playing"
        ? "Pysäytä toisto"
        : "Toista ääneen";

  const statusAnnouncement =
    state === "loading" ? "Ladataan ääntä" : state === "playing" ? "Ääni soi" : "";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={`flex items-center justify-center rounded p-0.5 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed ${
          isLoading ? "animate-pulse motion-reduce:animate-none" : ""
        }`}
      >
        {state === "playing" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07 1 1 0 0 1-1.41-1.41 3 3 0 0 0 0-4.24 1 1 0 0 1 1.41-1.42Z" />
            <path d="M18.36 5.64a9 9 0 0 1 0 12.73 1 1 0 0 1-1.42-1.42 7 7 0 0 0 0-9.9 1 1 0 0 1 1.42-1.41Z" />
          </svg>
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </span>
    </>
  );
}
