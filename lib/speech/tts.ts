import { generateSpeech } from "ai";
import { openai } from "@ai-sdk/openai";

/**
 * OpenAI:n puhesynteesimalli-id. `@ai-sdk/openai`:n `OpenAISpeechModelId`-tyyppi
 * sisältää myös uudemman `gpt-4o-mini-tts`:n, mutta OpenAI:n dokumentaation
 * mukaan kyseinen malli EI tue `speed`-parametria (se ohjaa nopeutta pelkillä
 * luonnollisen kielen `instructions`-ohjeilla). Koska hidastettu ääntäminen on
 * tämän sovelluksen ydinvaatimus (ks. docs/architecture-v2.md §5), valitaan
 * `tts-1`, joka tukee numeerista `speed`-parametria suoraan ja on laajimmin
 * tuettu OpenAI:n TTS-malliluokka.
 */
const SPEECH_MODEL_ID = "tts-1";

/**
 * OpenAI:n TTS-rajapinnan dokumentoitu sallittu `speed`-arvoalue on 0.25–4.0.
 * `@ai-sdk/openai`:n tyypitys (`OpenAISpeechModelId`/`generateSpeech`) ei itse
 * rajoita arvoa numeerisesti (pelkkä `speed?: number`), joten rajaus tehdään
 * tässä sovelluskerroksessa ennen kutsua.
 */
export const MIN_SPEED = 0.25;
export const MAX_SPEED = 4.0;
const DEFAULT_SPEED = 1.0;

/**
 * Sovellustason virhe puhesynteesiputkelle. Kantaa mukanaan HTTP-statuksen,
 * jotta `app/api/tts/route.ts` voi palauttaa järkevän vastauksen sen sijaan
 * että kaatuisi tuntemattomaan 500-virheeseen. Sama rakenne kuin `SttError`
 * tiedostossa `lib/speech/stt.ts`.
 */
export class TtsError extends Error {
  readonly status: 400 | 500;

  constructor(message: string, status: 400 | 500) {
    super(message);
    this.name = "TtsError";
    this.status = status;
  }
}

/**
 * Syntetisoi tekstin puheeksi OpenAI:n `tts-1`-mallilla.
 *
 * Käyttää AINA OpenAI:ta riippumatta `LLM_PROVIDER`-ympäristömuuttujasta,
 * koska Anthropic ei (vielä) tarjoa puhesynteesimalleja `@ai-sdk/anthropic`:ssa
 * — sama päätös kuin `transcribeAudio`:ssa (ks. `lib/speech/stt.ts`).
 *
 * Arkkitehtuuriperuste (docs/architecture-v2.md §5): selaimen natiivi
 * `speechSynthesis`-API tuottaa käyttöjärjestelmä-/selainriippuvaisen laatuisia
 * ääniä, ja koska ääntämisen kuunteleminen on nimenomaan yksi sovelluksen
 * ydinominaisuuksista kielenoppijalle (ei vain mukavuuslisä), TTS on
 * tarkoituksella toteutettu palvelinpuolisesti AI SDK:n `generateSpeech()`
 * -funktiolla, ei selain-APIlla.
 *
 * HUOM palautusarvon muodosta: AI SDK:n `generateSpeech()` (ai@7.0.30) palauttaa
 * `SpeechResult`, jonka `audio`-kenttä (`GeneratedAudioFile`) tarjoaa saman datan
 * sekä `uint8Array`- että `base64`-muodossa, ja `mediaType`-kentän (esim.
 * `audio/mpeg` mp3:lle). Tässä käytetään `uint8Array`+`mediaType`-paria, koska
 * `app/api/tts/route.ts` palauttaa raa'an binäärivastauksen suoraan clientille.
 */
export async function synthesizeSpeech({
  text,
  speed = DEFAULT_SPEED,
}: {
  text: string;
  speed?: number;
}): Promise<{ audio: Uint8Array; mediaType: string }> {
  const trimmedText = text.trim();

  if (trimmedText.length === 0) {
    throw new TtsError("Syntetisoitava teksti on tyhjä.", 400);
  }

  if (speed < MIN_SPEED || speed > MAX_SPEED) {
    throw new TtsError(
      `Puhenopeuden (speed) tulee olla välillä ${MIN_SPEED}–${MAX_SPEED}, saatiin: ${speed}.`,
      400,
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new TtsError(
      "OPENAI_API_KEY puuttuu ympäristöstä. Puhesynteesi vaatii aina OpenAI:n TTS-mallin riippumatta LLM_PROVIDER-asetuksesta.",
      500,
    );
  }

  try {
    const result = await generateSpeech({
      model: openai.speech(SPEECH_MODEL_ID),
      text: trimmedText,
      outputFormat: "mp3",
      speed,
    });

    return { audio: result.audio.uint8Array, mediaType: result.audio.mediaType };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tuntematon puhesynteesivirhe.";
    throw new TtsError(`Puhesynteesi epäonnistui: ${message}`, 500);
  }
}
