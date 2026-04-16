import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, rating, message, context } = body;

    if (!type || !rating) {
      return NextResponse.json({ 
        error: "Type and rating are required" 
      }, { status: 400 });
    }

    // Save feedback to database
    const feedback = await prisma.feedback.create({
      data: {
        userId: session.user.id!,
        type,
        rating: parseInt(rating),
        message: message || null,
        context: context ? JSON.stringify(context) : null,
      },
    });

    return NextResponse.json({
      success: true,
      id: feedback.id
    });

  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { userId: session.user.id! },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ feedbacks });

  } catch (error) {
    console.error("Get feedback error:", error);
    return NextResponse.json(
      { error: "Failed to get feedback" },
      { status: 500 }
    );
  }
}