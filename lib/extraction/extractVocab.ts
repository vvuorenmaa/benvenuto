import { generateObject } from "ai";
import { z } from "zod";
import { resolveModel } from "@/lib/ai/model";
import { db } from "@/lib/db/client";
import { vocabCards } from "@/lib/db/schema";
import type { Mode } from "@/lib/prompts";

// HUOM: kentät ovat `nullable()` (eivät `optional()`), koska OpenAI:n
// structured output -toteutus vaatii kaikkien objektin kenttien olevan
// mukana "required"-listassa — valinnaisuus ilmaistaan sallimalla `null`.
const ExtractionSchema = z.object({
  candidates: z.array(
    z.object({
      italian: z.string(),
      finnish: z.string(),
      exampleIt: z.string().nullable(),
      context: z.string().nullable(),
    }),
  ),
});

/**
 * Mode-kohtaiset extraction-promptit. Nämä ovat tarkoituksella eri promptit
 * kuin pääkeskustelun roolileikkipersoonat (`lib/prompts.ts`) — tehtävä on
 * puhtaasti mekaaninen poiminta, ei roolileikkiä.
 */
const EXTRACTION_PROMPTS: Record<Mode, string> = {
  grammar: `Olet sanaston poimintatyökalu. Saat syötteenä italian kielen opettajan vastauksen suomenkieliselle A2-B1-tason opiskelijalle.

Tehtäväsi: poimi vastauksesta italiankieliset sanat ja lauseet, jotka olisivat hyödyllisiä opiskelijan sanavarastoon (uudet, epätavallisemmat tai aiheeseen keskeisesti liittyvät sanat/ilmaisut — ÄLÄ poimi triviaaleja perussanoja kuten "ciao", "sì", "no", "e", "il/la").

Jokaiselle poimitulle sanalle/lauseelle anna:
- italian: sana tai lause italiaksi
- finnish: suomennos
- exampleIt: esimerkkilause italiaksi, JOS sellainen löytyy luonnollisesti tekstistä (ei tarvitse keksiä uutta)
- context: lyhyt suomenkielinen huomio asiayhteydestä, jos hyödyllistä

Jos vastauksessa ei ole mitään poimittavaa (esim. lyhyt tai triviaali vastaus), palauta tyhjä "candidates"-taulukko. Tämä on täysin normaalia.`,

  conversation: `Olet sanaston poimintatyökalu. Saat syötteenä italialaisen keskustelukumppanin vastauksen suomenkieliselle A2-B1-tason opiskelijalle.

Tehtäväsi: poimi vastauksesta italiankieliset sanat ja lauseet, jotka olisivat hyödyllisiä opiskelijan sanavarastoon (uudet, epätavallisemmat tai keskustelun aiheeseen keskeisesti liittyvät sanat/ilmaisut — ÄLÄ poimi triviaaleja perussanoja kuten "ciao", "sì", "no", "e", "il/la").

Jokaiselle poimitulle sanalle/lauseelle anna:
- italian: sana tai lause italiaksi
- finnish: suomennos
- exampleIt: esimerkkilause italiaksi, JOS sellainen löytyy luonnollisesti tekstistä (ei tarvitse keksiä uutta)
- context: lyhyt suomenkielinen huomio asiayhteydestä, jos hyödyllistä

Jos vastauksessa ei ole mitään poimittavaa (esim. lyhyt tai triviaali vastaus), palauta tyhjä "candidates"-taulukko. Tämä on täysin normaalia.`,

  phonetics: `Olet ääntämyshaasteiden poimintatyökalu. Saat syötteenä ääntämisvalmentajan vastauksen suomenkieliselle italian opiskelijalle.

Tehtäväsi: poimi vastauksesta NIMENOMAAN ne sanat/lauseet, joissa painotusta on korostettu (esim. Markdown-lihavointi kuten "ca**fè**") tai jotka on erikseen mainittu ääntämyshaasteena (esim. "gli", "gn", tuplakonsonantit).

Jokaiselle poimitulle sanalle/lauseelle anna:
- italian: sana tai lause italiaksi (ilman Markdown-lihavointimerkintöjä, pelkkänä tekstinä)
- finnish: suomennos
- exampleIt: esimerkkilause italiaksi, JOS sellainen löytyy luonnollisesti tekstistä
- context: lyhyt suomenkielinen maininta MIKSI sana on ääntämyshaaste (esim. "painotus toisella tavulla", "gli äännetään kielen kärki kitalakea vasten")

Jos vastauksessa ei ole mitään ääntämyshaasteita korostettuna (esim. lyhyt tai triviaali vastaus), palauta tyhjä "candidates"-taulukko. Tämä on täysin normaalia.`,
};

/**
 * Poimii assistentin vastauksesta sanastoa taustaprosessina ja tallentaa
 * löydökset `vocabCards`-tauluun. Tarkoitettu ajettavaksi Next.js:n
 * `after()`-hookissa vastauksen striimauksen jälkeen — ei saa koskaan
 * heittää poikkeusta ulospäin, ettei mikään käyttäjän näkemä prosessi kaadu.
 */
export async function extractVocab({
  mode,
  assistantText,
  messageId,
}: {
  mode: Mode;
  assistantText: string;
  messageId: number;
}): Promise<void> {
  try {
    const systemPrompt = EXTRACTION_PROMPTS[mode] ?? EXTRACTION_PROMPTS.conversation;

    const { object } = await generateObject({
      model: resolveModel(),
      schema: ExtractionSchema,
      system: systemPrompt,
      prompt: assistantText,
    });

    if (object.candidates.length === 0) {
      return;
    }

    const now = Date.now();

    for (const candidate of object.candidates) {
      db.insert(vocabCards)
        .values({
          italian: candidate.italian,
          finnish: candidate.finnish,
          exampleIt: candidate.exampleIt ?? null,
          context: candidate.context ?? null,
          sourceMode: mode,
          sourceMessageId: messageId,
          grammarTopicSlug: null,
          createdAt: now,
          easeFactor: 2.5,
          intervalDays: 0,
          repetitions: 0,
          dueAt: now,
          lastReviewedAt: null,
          suspended: 0,
        })
        .run();
    }
  } catch (error) {
    console.error("extractVocab: sanaston poiminta epäonnistui", error);
  }
}
