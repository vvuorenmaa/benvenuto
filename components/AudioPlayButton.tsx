"use client";

import { useCallback, useRef, useState } from "react";
import { Volume2, Pause } from "lucide-react";

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
        className={`flex items-center justify-center rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed ${
          isLoading ? "animate-pulse motion-reduce:animate-none" : ""
        }`}
      >
        {state === "playing" ? (
          <Pause className="h-3.5 w-3.5" aria-hidden="true" fill="currentColor" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </span>
    </>
  );
}
