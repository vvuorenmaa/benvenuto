"use client";

import { useCallback, useRef, useState } from "react";
import { Mic } from "lucide-react";

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
        className={`flex items-center justify-center rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 disabled:cursor-not-allowed ${
          permissionError
            ? "bg-red-500/10 text-red-500"
            : state === "recording"
              ? "bg-red-500/10 text-red-500 animate-pulse motion-reduce:animate-none"
              : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
        } ${isTranscribing ? "opacity-60 animate-pulse motion-reduce:animate-none" : ""}`}
      >
        <Mic className="h-4 w-4" aria-hidden="true" />
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </span>
    </>
  );
}
