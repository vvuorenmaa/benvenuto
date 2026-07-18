import { NextResponse } from "next/server";
import { z } from "zod";
import { MAX_SPEED, MIN_SPEED, TtsError, synthesizeSpeech } from "@/lib/speech/tts";

export const maxDuration = 30;

const ttsRequestSchema = z.object({
  text: z.string().min(1, "text ei voi olla tyhjä."),
  speed: z.number().min(MIN_SPEED).max(MAX_SPEED).optional(),
});

/**
 * Ottaa vastaan JSON-bodyn `{ text, speed? }` ja palauttaa syntetisoidun
 * puheen raakana binäärivastauksena (esim. `audio/mpeg`), jotta client voi
 * soittaa sen suoraan `<audio>`-elementillä tai `Blob`-URL:lla ilman
 * base64-kääreitä. Ks. `lib/speech/tts.ts` perustelut mallivalinnalle.
 */
export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Pyynnön body ei ole validia JSON:ia." }, { status: 400 });
  }

  const parsed = ttsRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  try {
    const { audio, mediaType } = await synthesizeSpeech(parsed.data);
    // `Buffer.from` kääri `Uint8Array`:in Node-runtimen `Buffer`:iksi, joka
    // toteuttaa `BodyInit`-tyypin täsmällisesti (ArrayBuffer-taustainen),
    // toisin kuin geneerinen `Uint8Array<ArrayBufferLike>`.
    return new Response(Buffer.from(audio), {
      status: 200,
      headers: { "Content-Type": mediaType },
    });
  } catch (error) {
    if (error instanceof TtsError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Odottamaton virhe puhesynteesissä." }, { status: 500 });
  }
}
