import { NextResponse } from "next/server";
import { SttError, transcribeAudio } from "@/lib/speech/stt";

export const maxDuration = 30;

/**
 * Ottaa vastaan raa'an äänidatan (esim. `MediaRecorder`:in tuottaman `Blob`:in
 * suoraan `fetch`-pyynnön bodynä `audio/webm`-`Content-Type`:lla) ja palauttaa
 * transkriboidun tekstin. Ks. `lib/speech/stt.ts` perustelut mallivalinnalle.
 */
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type");

  if (contentType && !contentType.toLowerCase().startsWith("audio/")) {
    return NextResponse.json(
      { error: `Odotettiin audio/*-Content-Type-headeria, saatiin: ${contentType}` },
      { status: 400 },
    );
  }

  const arrayBuffer = await req.arrayBuffer();
  const audio = new Uint8Array(arrayBuffer);

  try {
    const { text } = await transcribeAudio(audio);
    return NextResponse.json({ text }, { status: 200 });
  } catch (error) {
    if (error instanceof SttError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Odottamaton virhe transkriptiossa." }, { status: 500 });
  }
}
