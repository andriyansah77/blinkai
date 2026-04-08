import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { grantCredits, SIGNUP_BONUS } from "@/lib/credits";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user + credit ledger + api key config in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Create signup bonus credit ledger entry
      await tx.creditLedger.create({
        data: {
          userId: newUser.id,
          amount: SIGNUP_BONUS,
          reason: "signup_bonus",
          meta: JSON.stringify({ note: "Welcome bonus" }),
        },
      });

      // Create default ApiKeyConfig (platform mode)
      await tx.apiKeyConfig.create({
        data: {
          userId: newUser.id,
          mode: "platform",
        },
      });

      return newUser;
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Suppress unused import warning
void grantCredits;
