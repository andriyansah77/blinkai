import { NextResponse } from "next/server";
import { TEMPLATES } from "@/types";

export async function GET() {
  return NextResponse.json(TEMPLATES);
}
