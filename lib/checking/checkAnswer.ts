import { generateObject } from "ai";
import { z } from "zod";
import { resolveModel } from "@/lib/ai/model";

const AnswerCheckSchema = z.object({
  correct: z.boolean(),
  feedback: z.string(),
});

const SYSTEM_PROMPT = `Olet suomen kielen tarkistaja italian kielen opiskelijalle. Saat kolme tietoa: italiankielisen sanan/lauseen, kortille tallennetun ESIMERKKISUOMENNOKSEN, ja opiskelijan ITSE kirjoittaman/sanoman vastauksen.

TÄRKEÄÄ KONTEKSTISTA: opiskelija näkee kertauksessa VAIN italiankielisen sanan/lauseen, EI mitään esimerkkilausetta tai käyttöyhteyttä. Kortille tallennettu suomennos on poimittu yhdestä satunnaisesta keskusteluhetkestä eikä ole ainoa oikea vastaus — monilla italian sanoilla on useita täysin erillisiä, yleisesti tunnettuja merkityksiä (esim. "ci" voi tarkoittaa "meille/meitä" TAI paikan adverbina "siellä/sinne" TAI olla osa "c'è"/"ci sono" = "on/ovat"; "gli" on sekä epäsuora pronomini "hänelle" että monikon määräinen artikkeli tietyille maskuliinisanoille; "porta" on sekä "ovi" että verbin "portare" taivutusmuoto "hän kantaa"). Opiskelijalla ei ole mitään keinoa arvata KUMPAA merkitystä kortti tarkoittaa, joten HYVÄKSY vastaus aina kun se on jokin italiankielisen sanan/lauseen yleisesti tunnettu, sanakirjan mukainen merkitys — ÄLÄ hylkää sitä vain siksi ettei se täsmää nimenomaan tallennettuun esimerkkisuomennokseen. Hyväksy myös synonyymit, eri sanamuodot, aikamuotovaihtelut ja pienet kirjoitusvirheet jotka eivät muuta merkitystä (esim. "olen syönyt" ja "söin" ovat molemmat oikein "ho mangiato":lle).

Ole TIUKKA vain jos vastaus ei vastaa MITÄÄN kyseisen italiankielisen ilmaisun tunnettua merkitystä, tai on tyhjä/asiaton. Anna lyhyt, kannustava suomenkielinen palaute (1 lause): jos oikein, vahvista lyhyesti; jos väärin, kerro mikä meni pieleen ja mainitse kortin esimerkkisuomennos.`;

/**
 * Tarkistaa opiskelijan aktiivisesti tuottaman suomennoksen LLM:llä.
 * Käytetään kertaus-näkymässä, jossa käyttäjä kirjoittaa/sanoo vastauksen
 * itse (ei pelkkää itsearviointia). Ei koskaan päivitä SRS-tilaa — se on
 * kutsujan (`/api/vocab/review`) vastuulla.
 */
export async function checkAnswer({
  italian,
  correctFinnish,
  userAnswer,
}: {
  italian: string;
  correctFinnish: string;
  userAnswer: string;
}): Promise<{ correct: boolean; feedback: string }> {
  if (userAnswer.trim() === "") {
    return { correct: false, feedback: "Et kirjoittanut vastausta." };
  }

  const { object } = await generateObject({
    model: resolveModel(),
    schema: AnswerCheckSchema,
    system: SYSTEM_PROMPT,
    prompt: `Italiankielinen sana/lause: "${italian}"\nKortin esimerkkisuomennos (yksi mahdollinen merkitys, ei ainoa oikea): "${correctFinnish}"\nOpiskelijan vastaus: "${userAnswer}"`,
  });

  return object;
}
