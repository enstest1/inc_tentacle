import { NextResponse } from "next/server";
import { prepareBatch, type PrepareBatchInput } from "@/lib/agent";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PrepareBatchInput;
    const prepared = prepareBatch(body);
    return NextResponse.json(prepared, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid batch request" },
      { status: 400 },
    );
  }
}
