import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "content-ops-foundation",
    timestamp: new Date().toISOString(),
  });
}
