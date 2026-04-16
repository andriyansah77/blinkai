import { NextRequest, NextResponse } from "next/server";
import { TEMPLATES } from "@/types";

export async function GET(request: NextRequest) {
  return NextResponse.json(TEMPLATES);
}
