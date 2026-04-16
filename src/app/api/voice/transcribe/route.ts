import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { getUserAIConfig } from "@/lib/platform";

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Get user's AI config for transcription
    const aiConfig = await getUserAIConfig(session.user.id!);

    // Use OpenAI Whisper API for transcription
    const transcriptionFormData = new FormData();
    transcriptionFormData.append('file', audioFile);
    transcriptionFormData.append('model', 'whisper-1');

    const response = await fetch(`${aiConfig.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiConfig.apiKey}`,
      },
      body: transcriptionFormData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      text: result.text
    });

  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}