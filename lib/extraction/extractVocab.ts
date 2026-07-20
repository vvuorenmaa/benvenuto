import { generateObject } from "ai";
import { z } from "zod";
import { resolveModel } from "@/lib/ai/model";
import { db } from "@/lib/db/client";
import { vocabCards } from "@/lib/db/schema";
import { findMatchingGrammarTopic } from "@/lib/grammar/search";
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
 * Karsii ilmiselvästi virheelliset poiminnat ennen tallennusta. Havaittu
 * tuotannossa (2026-07-19): LLM poimii toisinaan assistentin SUOMENKIELISEN
 * selityksen fragmentin ("epäsuora pronomini", "yksikössä") "italian"-kenttään
 * — nämä tunnistaa suomen kielelle ominaisista kirjaimista (ä/ö) tai siitä
 * että "italian" ja "finnish" ovat identtiset (ei todellista käännöstä
 * tapahtunut). Tällaiset kortit rikkovat kertauksen, koska korttiin ei
 * todellisuudessa voi vastata italiaksi.
 */
function isValidVocabCandidate(candidate: { italian: string; finnish: string }): boolean {
  const italian = candidate.italian.trim();
  const finnish = candidate.finnish.trim();

  if (italian.length === 0 || finnish.length === 0) return false;
  if (/[äöÄÖ]/.test(italian)) return false;
  if (italian.toLowerCase() === finnish.toLowerCase()) return false;

  return true;
}

/**
 * Normalisoi vertailua varten: pienet kirjaimet + trim, jotta "Ciao" ja "ciao "
 * tunnistetaan samaksi sanaksi eivätkä tuota erillisiä kortteja.
 */
function normalizeItalian(italian: string): string {
  return italian.trim().toLowerCase();
}

const ValidationSchema = z.object({
  items: z.array(
    z.object({
      isValidItalian: z.boolean(),
      finnishTranslation: z.string(),
    }),
  ),
});

const VALIDATION_SYSTEM_PROMPT = `Olet italian kielen kääntäjä. Saat numeroidun listan tekstinpätkiä, joiden väitetään olevan italiaa.

Jokaiselle, TÄSMÄLLEEN SAMASSA JÄRJESTYKSESSÄ kuin annettu, palauta:
- isValidItalian: true VAIN JOS teksti on aidosti kirjoitettu italiaksi (ei suomea, ei muuta kieltä, ei sekasotkuista/korruptoitunutta tekstiä kuten kieliopin termin vääristynyt muoto — esim. "apverbia" tai "taivutusmuotonsa" EIVÄT ole italiaa).
- finnishTranslation: käännä teksti KOKONAAN ITSE, omasta kielitaidostasi, parhaaksi yleispäteväksi suomennokseksi — ÄLÄ tukeudu mihinkään aiempaan käännökseen, koska sitä ei anneta sinulle. Jos teksti on verbin taivutusmuoto, käännä juuri se taivutusmuoto (esim. "ho" = "minulla on", ei "olen", koska "ho" on avere-verbin eikä essere-verbin muoto). Jos isValidItalian on false, palauta tyhjä merkkijono.

Palauta TÄSMÄLLEEN yhtä monta "items"-alkiota kuin annettiin tekstinpätkiä, samassa järjestyksessä — tämä on kriittistä koska tuloksia yhdistetään alkuperäisiin ehdokkaisiin indeksin perusteella.`;

/**
 * Toinen, kevyt LLM-tarkistuskutsu ennen tallennusta: varmistaa että
 * "italian"-kenttä on aidosti italiaa (ei vain suomenkielistä tekstiä ilman
 * ä/ö-kirjaimia, jota `isValidVocabCandidate` ei tunnista — havaittu
 * tuotannossa 2026-07-20, esim. "apverbia", "taivutusmuotonsa") ja tuottaa
 * käännöksen TÄYSIN ITSE ilman alkuperäistä `finnish`-arvoa syötteenä —
 * jos alkuperäinen annettaisiin vertailtavaksi, malli ankkuroituu siihen ja
 * jättää selvätkin virheet korjaamatta (havaittu testissä: "ho"/"olen"-virhe
 * säilyi kun malli sai nähdä alkuperäisen arvon, mutta korjautui oikein kun
 * käännös piti tuottaa täysin tyhjästä). Palauttaa alkuperäiset ehdokkaat
 * sellaisenaan jos validointikutsu epäonnistuu tai palauttaa odottamattoman
 * määrän tuloksia (fail open — ei estä koko poimintaa yhden validointivirheen
 * takia).
 */
async function validateCandidates<
  T extends { italian: string; finnish: string },
>(candidates: T[]): Promise<T[]> {
  try {
    const { object } = await generateObject({
      model: resolveModel(),
      schema: ValidationSchema,
      system: VALIDATION_SYSTEM_PROMPT,
      prompt: candidates.map((c, i) => `${i + 1}. ${c.italian}`).join("\n"),
    });

    if (object.items.length !== candidates.length) {
      console.error(
        "extractVocab: validointi palautti väärän määrän tuloksia, ohitetaan validointi",
      );
      return candidates;
    }

    return candidates
      .map((candidate, i) => ({ candidate, validation: object.items[i] }))
      .filter(({ validation }) => validation.isValidItalian)
      .map(({ candidate, validation }) => ({
        ...candidate,
        finnish: validation.finnishTranslation || candidate.finnish,
      }));
  } catch (error) {
    console.error("extractVocab: validointikutsu epäonnistui, käytetään alkuperäisiä", error);
    return candidates;
  }
}

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

    const validCandidates = object.candidates.filter(isValidVocabCandidate);

    if (validCandidates.length === 0) {
      return;
    }

    const existingRows = db.select({ italian: vocabCards.italian }).from(vocabCards).all();
    const existingItalian = new Set(existingRows.map((row) => normalizeItalian(row.italian)));

    const seenInBatch = new Set<string>();
    const newCandidates = validCandidates.filter((candidate) => {
      const key = normalizeItalian(candidate.italian);
      if (existingItalian.has(key) || seenInBatch.has(key)) return false;
      seenInBatch.add(key);
      return true;
    });

    if (newCandidates.length === 0) {
      return;
    }

    const validatedCandidates = await validateCandidates(newCandidates);

    if (validatedCandidates.length === 0) {
      return;
    }

    const now = Date.now();
    const matchedTopic = findMatchingGrammarTopic(assistantText);

    for (const candidate of validatedCandidates) {
      db.insert(vocabCards)
        .values({
          italian: candidate.italian,
          finnish: candidate.finnish,
          exampleIt: candidate.exampleIt ?? null,
          context: candidate.context ?? null,
          sourceMode: mode,
          sourceMessageId: messageId,
          grammarTopicSlug: matchedTopic?.slug ?? null,
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
