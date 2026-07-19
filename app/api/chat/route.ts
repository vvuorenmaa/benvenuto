import { after } from "next/server";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { SYSTEM_PROMPTS, type Mode } from "@/lib/prompts";
import { resolveModel } from "@/lib/ai/model";
import { db } from "@/lib/db/client";
import { messages as messagesTable } from "@/lib/db/schema";
import { extractVocab } from "@/lib/extraction/extractVocab";

export const maxDuration = 30;

function extractPlainText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export async function POST(req: Request) {
  const {
    messages,
    mode,
    sessionId,
  }: { messages: UIMessage[]; mode: Mode; sessionId: string | undefined } = await req.json();

  const systemPrompt = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.grammar;

  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const userContent = lastUserMessage ? extractPlainText(lastUserMessage) : "";

  const result = streamText({
    model: resolveModel(),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      const createdAt = Date.now();

      db.insert(messagesTable)
        .values({ mode, role: "user", content: userContent, createdAt, sessionId: sessionId ?? null })
        .run();

      const assistantResult = db
        .insert(messagesTable)
        .values({ mode, role: "assistant", content: text, createdAt, sessionId: sessionId ?? null })
        .run();
      const assistantId = Number(assistantResult.lastInsertRowid);

      after(() => extractVocab({ mode, assistantText: text, messageId: assistantId }));
    },
  });

  return result.toUIMessageStreamResponse();
}
