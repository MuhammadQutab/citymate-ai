import { ApiError, GoogleGenAI, ThinkingLevel, type Content } from "@google/genai";
import { z } from "zod";
import { createBreaker } from "../server/guards";

/** Default model, verified available on the free tier (Oct 2026). Override with GEMINI_MODEL. */
export const DEFAULT_MODEL = "gemini-3.5-flash-lite";

export class AiUnavailableError extends Error {
  constructor(
    public readonly reason: "no_key" | "quota" | "timeout" | "error" | "invalid_output",
    detail?: string,
  ) {
    super(`AI unavailable: ${reason}${detail ? ` (${detail})` : ""}`);
    this.name = "AiUnavailableError";
  }
}

let client: GoogleGenAI | null = null;

/** Per-instance cooldown after quota/outage errors (see src/lib/server/guards.ts). */
export const aiBreaker = createBreaker();

export function aiEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new AiUnavailableError("no_key");
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

type JsonCall<T extends z.ZodType> = {
  schema: T;
  system: string;
  contents: Content[];
  maxOutputTokens?: number;
  timeoutMs?: number;
};

/** One bounded, structured Gemini call. Output is validated; anything off-schema is rejected. */
export async function generateJson<T extends z.ZodType>({
  schema,
  system,
  contents,
  maxOutputTokens = 400,
  timeoutMs = 18_000,
}: JsonCall<T>): Promise<z.infer<T>> {
  const ai = getClient();
  if (aiBreaker.isOpen()) throw new AiUnavailableError("quota", "cooling down after upstream errors");
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);
  try {
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction: system,
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(schema),
        temperature: 0.3,
        maxOutputTokens,
        // Routing and short narration need little reasoning; minimal thinking cuts latency.
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        abortSignal: abort.signal,
      },
    });
    let json: unknown;
    try {
      json = JSON.parse(res.text ?? "");
    } catch {
      throw new AiUnavailableError("invalid_output", "non-JSON response");
    }
    const parsed = schema.safeParse(json);
    if (!parsed.success) throw new AiUnavailableError("invalid_output", parsed.error.issues[0]?.message);
    return parsed.data;
  } catch (err) {
    if (err instanceof AiUnavailableError) throw err;
    if (abort.signal.aborted) {
      aiBreaker.trip(15_000);
      throw new AiUnavailableError("timeout");
    }
    if (err instanceof ApiError && err.status === 429) {
      // Free quota exhausted: stop calling for a minute so users get instant basic answers.
      aiBreaker.trip(60_000);
      throw new AiUnavailableError("quota");
    }
    if (err instanceof ApiError && err.status >= 500) aiBreaker.trip(15_000);
    throw new AiUnavailableError("error", err instanceof Error ? err.message.slice(0, 120) : undefined);
  } finally {
    clearTimeout(timer);
  }
}
