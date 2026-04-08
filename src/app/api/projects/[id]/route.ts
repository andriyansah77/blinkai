import { NextRequest, NextResponse } from "next/server";

// Legacy projects API — the Project model has been replaced by Agent.
// These routes are kept for backwards compatibility but return 410 Gone.

export async function GET(
  _request: NextRequest,
  _ctx: { params: { id: string } }
) {
  return NextResponse.json(
    { error: "Projects API is deprecated. Use /api/agents instead." },
    { status: 410 }
  );
}

export async function PATCH(
  _request: NextRequest,
  _ctx: { params: { id: string } }
) {
  return NextResponse.json(
    { error: "Projects API is deprecated. Use /api/agents instead." },
    { status: 410 }
  );
}

export async function DELETE(
  _request: NextRequest,
  _ctx: { params: { id: string } }
) {
  return NextResponse.json(
    { error: "Projects API is deprecated. Use /api/agents instead." },
    { status: 410 }
  );
}
