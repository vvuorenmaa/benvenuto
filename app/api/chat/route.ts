import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { SYSTEM_PROMPTS, type Mode } from "@/lib/prompts";
import { db } from "@/lib/db/client";
import { messages as messagesTable } from "@/lib/db/schema";

export const maxDuration = 30;

function resolveModel() {
  const provider = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();

  if (provider === "anthropic") {
    return anthropic(process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5");
  }

  return openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini");
}

function extractPlainText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export async function POST(req: Request) {
  const { messages, mode }: { messages: UIMessage[]; mode: Mode } = await req.json();

  const systemPrompt = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.grammar;

  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const userContent = lastUserMessage ? extractPlainText(lastUserMessage) : "";

  const result = streamText({
    model: resolveModel(),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    onFinish: ({ text }) => {
      const createdAt = Date.now();
      db.insert(messagesTable)
        .values([
          { mode, role: "user", content: userContent, createdAt },
          { mode, role: "assistant", content: text, createdAt },
        ])
        .run();
    },
  });

  return result.toUIMessageStreamResponse();
}
