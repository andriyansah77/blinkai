import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { obfuscate, deobfuscate } from "@/lib/platform";

function maskKey(key: string): string {
  if (!key || key.length < 8) return "••••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await prisma.apiKeyConfig.findUnique({
    where: { userId: session.user.id },
  });

  if (!config) {
    return NextResponse.json({
      mode: "platform",
      byokApiKey: null,
      byokBaseUrl: null,
      byokModel: null,
    });
  }

  const secret = process.env.NEXTAUTH_SECRET || "default-secret";
  const deobfuscatedKey = config.byokApiKey
    ? deobfuscate(config.byokApiKey, secret)
    : null;

  return NextResponse.json({
    mode: config.mode,
    byokApiKey: deobfuscatedKey ? maskKey(deobfuscatedKey) : null,
    byokBaseUrl: config.byokBaseUrl,
    byokModel: config.byokModel,
  });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    mode?: "platform" | "byok";
    byokApiKey?: string;
    byokBaseUrl?: string;
    byokModel?: string;
  };

  const secret = process.env.NEXTAUTH_SECRET || "default-secret";

  const updateData: {
    mode?: string;
    byokApiKey?: string | null;
    byokBaseUrl?: string | null;
    byokModel?: string | null;
  } = {};

  if (body.mode !== undefined) {
    updateData.mode = body.mode;
  }

  if (body.byokApiKey !== undefined) {
    // Only obfuscate if it's a real key (not a masked value)
    if (body.byokApiKey && !body.byokApiKey.includes("••••")) {
      updateData.byokApiKey = obfuscate(body.byokApiKey, secret);
    }
  }

  if (body.byokBaseUrl !== undefined) {
    updateData.byokBaseUrl = body.byokBaseUrl || null;
  }

  if (body.byokModel !== undefined) {
    updateData.byokModel = body.byokModel || null;
  }

  const config = await prisma.apiKeyConfig.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      mode: body.mode || "platform",
      byokApiKey: updateData.byokApiKey ?? null,
      byokBaseUrl: body.byokBaseUrl ?? null,
      byokModel: body.byokModel ?? null,
    },
    update: updateData,
  });

  return NextResponse.json({ success: true, mode: config.mode });
}
