"use client";

import { useCallback, useRef, useState } from "react";

type RecordingState = "idle" | "recording" | "transcribing";

const PREFERRED_MIME_TYPE = "audio/webm;codecs=opus";

function pickMimeType(): string {
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(PREFERRED_MIME_TYPE)) {
    return PREFERRED_MIME_TYPE;
  }
  // Fallback selaimen oletukseen (esim. Safari ei tue opus/webm-yhdistelmää).
  return "";
}

export function MicButton({
  onTranscript,
  onRecordingChange,
  disabled = false,
}: {
  onTranscript: (text: string) => void;
  onRecordingChange?: (isRecording: boolean) => void;
  disabled?: boolean;
}) {
  const [state, setState] = useState<RecordingState>("idle");
  const [permissionError, setPermissionError] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const setRecording = useCallback(
    (isRecording: boolean) => {
      onRecordingChange?.(isRecording);
    },
    [onRecordingChange],
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setState("transcribing");

        try {
          const blob = new Blob(chunksRef.current, {
            type: mediaRecorder.mimeType || mimeType || "audio/webm",
          });

          const res = await fetch("/api/stt", {
            method: "POST",
            headers: { "Content-Type": blob.type },
            body: blob,
          });

          if (res.ok) {
            const { text } = (await res.json()) as { text: string };
            if (text && text.trim()) {
              onTranscript(text.trim());
            }
          } else {
            console.error("STT-pyyntö epäonnistui:", res.status, await res.text());
          }
        } catch (error) {
          console.error("Virhe litteroinnin haussa:", error);
        } finally {
          setState("idle");
          setRecording(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setState("recording");
      setRecording(true);
    } catch (error) {
      console.error("Mikrofonin käyttöoikeus evätty tai laitetta ei löytynyt:", error);
      setPermissionError(true);
      setState("idle");
      setRecording(false);
      setTimeout(() => setPermissionError(false), 1500);
    }
  }, [onTranscript, setRecording]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  function handleClick() {
    if (state === "idle") {
      void startRecording();
    } else if (state === "recording") {
      stopRecording();
    }
  }

  const isTranscribing = state === "transcribing";

  const ariaLabel =
    state === "recording"
      ? "Lopeta äänitallennus ja litteroi"
      : state === "transcribing"
        ? "Litteroidaan..."
        : "Aloita äänitallennus";

  const statusAnnouncement =
    state === "recording"
      ? "Nauhoitus käynnissä"
      : state === "transcribing"
        ? "Litteroidaan puhetta"
        : "";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isTranscribing}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={`flex items-center justify-center rounded-full p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed ${
          permissionError
            ? "bg-red-600 text-white"
            : state === "recording"
              ? "bg-red-500 text-white animate-pulse motion-reduce:animate-none"
              : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600"
        } ${isTranscribing ? "opacity-60 animate-pulse motion-reduce:animate-none" : ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" />
          <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.07A7 7 0 0 0 19 11Z" />
        </svg>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </span>
    </>
  );
}
