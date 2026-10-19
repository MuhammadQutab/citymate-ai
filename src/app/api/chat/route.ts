import { NextResponse, type NextRequest } from "next/server";
import { badRequest, errorResponse } from "@/lib/api/http";
import { runAgent } from "@/lib/agent/agent";
import { ChatRequestSchema } from "@/lib/agent/types";

// Two bounded model calls (≤18 s each) plus data lookups; within Vercel Hobby limits.
export const maxDuration = 60;

/**
 * POST /api/chat  { message, history?, city?, near?, lastCategories? }
 * → ChatResponse (see src/lib/agent/types.ts). Stateless: clients keep history.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "Request body must be JSON." }, { status: 400 });
  }
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error);
  try {
    return NextResponse.json(await runAgent(parsed.data), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return errorResponse(err, "chat");
  }
}
