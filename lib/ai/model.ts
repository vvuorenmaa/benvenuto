import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

/**
 * Valitsee käytettävän kielimallin `LLM_PROVIDER`-ympäristömuuttujan perusteella.
 * Käytetään sekä pääkeskustelun striimauksessa (`app/api/chat/route.ts`) että
 * sanaston poiminnassa (`lib/extraction/extractVocab.ts`) — molemmat ovat
 * riittävän kevyitä tehtäviä samalle halvalle/nopealle oletusmallille.
 */
export function resolveModel() {
  const provider = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();

  if (provider === "anthropic") {
    return anthropic(process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5");
  }

  return openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini");
}
