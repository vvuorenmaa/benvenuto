import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { SYSTEM_PROMPTS, type Mode } from "@/lib/prompts";

export const maxDuration = 30;

function resolveModel() {
  const provider = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();

  if (provider === "anthropic") {
    return anthropic(process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-20241022");
  }

  return openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini");
}

export async function POST(req: Request) {
  const { messages, mode }: { messages: UIMessage[]; mode: Mode } = await req.json();

  const systemPrompt = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.grammar;

  const result = streamText({
    model: resolveModel(),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
