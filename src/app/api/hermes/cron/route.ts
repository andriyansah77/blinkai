import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { hermesIntegration } from "@/lib/hermes-integration";

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cronJobs = await hermesIntegration.getCronJobs(session.user.id!);
    
    return NextResponse.json({
      success: true,
      jobs: cronJobs
    });
  } catch (error) {
    console.error("Get cron jobs error:", error);
    return NextResponse.json(
      { error: "Failed to get cron jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, name, schedule, prompt, skills } = body;

    switch (action) {
      case 'create':
        if (!name || !schedule || !prompt) {
          return NextResponse.json({ 
            error: "Name, schedule, and prompt are required" 
          }, { status: 400 });
        }

        const createResult = await hermesIntegration.createCronJob(session.user.id!, {
          name,
          schedule,
          prompt,
          skills
        });
        return NextResponse.json(createResult);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Cron job action error:", error);
    return NextResponse.json(
      { error: "Failed to perform cron job action" },
      { status: 500 }
    );
  }
}