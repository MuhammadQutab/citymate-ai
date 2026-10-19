import { NextResponse, type NextRequest } from "next/server";
import { runAgent } from "@/lib/agent/agent";
import { ChatRequestSchema } from "@/lib/agent/types";
import { OverpassUnavailableError } from "@/lib/places/overpass";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) },
      { status: 400 },
    );
  }
  try {
    const res = await runAgent(parsed.data);
    return NextResponse.json(res, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof OverpassUnavailableError) {
      return NextResponse.json(
        { error: "data_source_unavailable", message: "OpenStreetMap's live servers are busy. Try again shortly or pick a supported city." },
        { status: 503 },
      );
    }
    console.error("[chat] failed", err);
    return NextResponse.json({ error: "internal_error", message: "Mate hit a snag. Please try again." }, { status: 500 });
  }
}
