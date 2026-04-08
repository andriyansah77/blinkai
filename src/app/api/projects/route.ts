import { NextRequest, NextResponse } from "next/server";

// Legacy projects API — the Project model has been replaced by Agent.
// These routes are kept for backwards compatibility but return 410 Gone.

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    { error: "Projects API is deprecated. Use /api/agents instead." },
    { status: 410 }
  );
}

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: "Projects API is deprecated. Use /api/agents instead." },
    { status: 410 }
  );
}
