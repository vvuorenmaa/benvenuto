import { transcribe } from "ai";
import { openai } from "@ai-sdk/openai";

/**
 * OpenAI:n transkriptiomalli-id. `whisper-1` on yleisin/laajimmin tuettu
 * Whisper-luokan malli `@ai-sdk/openai`:n `OpenAITranscriptionModelId`-tyypissä.
 */
const TRANSCRIPTION_MODEL_ID = "whisper-1";

/**
 * Sovellustason virhe transkriptioputkelle. Kantaa mukanaan HTTP-statuksen,
 * jotta `app/api/stt/route.ts` voi palauttaa järkevän vastauksen sen sijaan
 * että kaatuisi tuntemattomaan 500-virheeseen.
 */
export class SttError extends Error {
  readonly status: 400 | 500;

  constructor(message: string, status: 400 | 500) {
    super(message);
    this.name = "SttError";
    this.status = status;
  }
}

/**
 * Transkriboi raa'an äänidatan tekstiksi OpenAI:n Whisper-mallilla.
 *
 * Käyttää AINA OpenAI:ta riippumatta `LLM_PROVIDER`-ympäristömuuttujasta,
 * koska Anthropic ei (vielä) tarjoa transkriptiomalleja `@ai-sdk/anthropic`:ssa.
 *
 * Arkkitehtuuriperuste (docs/architecture-v2.md §5): selaimen natiivi
 * `SpeechRecognition`-API on taipuvainen "korjaamaan" käyttäjän ääntämyksen
 * kohti todennäköisintä sanakirjasanaa kielimallinsa biasin takia. Whisper on
 * huomattavasti kirjaimellisempi, mikä on kriittistä Fonetista-tilan
 * ääntämyshaasteiden tunnistamiselle — siksi STT on tarkoituksella toteutettu
 * palvelinpuolisesti AI SDK:n `transcribe()`-funktiolla, ei selain-APIlla.
 *
 * HUOM audio-parametrin mediatyypistä: AI SDK:n `transcribe()` (ai@7.0.30)
 * EI ota vastaan erillistä `mediaType`-parametria — se päättelee mediatyypin
 * automaattisesti audiodatan tavusignatuurista (`detectMediaType`, oletuksena
 * `audio/wav` jos tunnistus epäonnistuu). `audio/webm` (MediaRecorder-oletus)
 * on tunnettujen signatuurien joukossa, joten selkeä `Content-Type`-header
 * riittää HTTP-tasolla validointiin, mutta sitä ei välitetä eteenpäin
 * transkriptiofunktiolle — funktio ei sitä käytä.
 */
export async function transcribeAudio(audio: Uint8Array): Promise<{ text: string }> {
  if (audio.byteLength === 0) {
    throw new SttError("Äänidata on tyhjä.", 400);
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new SttError(
      "OPENAI_API_KEY puuttuu ympäristöstä. Transkriptio vaatii aina OpenAI:n Whisper-mallin riippumatta LLM_PROVIDER-asetuksesta.",
      500,
    );
  }

  try {
    const result = await transcribe({
      model: openai.transcription(TRANSCRIPTION_MODEL_ID),
      audio,
    });

    return { text: result.text };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tuntematon transkriptiovirhe.";
    throw new SttError(`Transkriptio epäonnistui: ${message}`, 500);
  }
}
