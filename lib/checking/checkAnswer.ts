import { generateObject } from "ai";
import { z } from "zod";
import { resolveModel } from "@/lib/ai/model";

const AnswerCheckSchema = z.object({
  correct: z.boolean(),
  feedback: z.string(),
});

const SYSTEM_PROMPT = `Olet suomen kielen tarkistaja italian kielen opiskelijalle. Saat kolme tietoa: italiankielisen sanan/lauseen, sen VIRALLISEN suomennoksen, ja opiskelijan ITSE kirjoittaman/sanoman vastauksen. Arvioi vastaako opiskelijan vastaus MERKITYKSELTÄÄN virallista suomennosta — hyväksy synonyymit, eri sanamuodot, aikamuotovaihtelut ja pienet kirjoitusvirheet jotka eivät muuta merkitystä (esim. "olen syönyt" ja "söin" ovat molemmat oikein "ho mangiato":lle). Ole TIUKKA vain jos merkitys on selvästi väärä tai vastaus on tyhjä/asiaton. Anna lyhyt, kannustava suomenkielinen palaute (1 lause): jos oikein, vahvista lyhyesti; jos väärin, kerro mikä meni pieleen ja mainitse oikea vastaus.`;

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
    prompt: `Italiankielinen sana/lause: "${italian}"\nVirallinen suomennos: "${correctFinnish}"\nOpiskelijan vastaus: "${userAnswer}"`,
  });

  return object;
}
