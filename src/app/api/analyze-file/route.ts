import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { readFile } from "fs/promises";
import path from "path";
import { getUserAIConfig } from "@/lib/platform";

// File analysis utilities
async function analyzeTextFile(filepath: string): Promise<string> {
  const content = await readFile(filepath, 'utf-8');
  return content.slice(0, 10000); // Limit to 10k chars
}

async function analyzePDF(filepath: string): Promise<string> {
  try {
    // For now, return a placeholder until we can properly configure PDF parsing
    const stats = await readFile(filepath);
    return `[PDF file uploaded: ${Math.round(stats.length / 1024)}KB - PDF text extraction will be available in a future update. For now, please describe what you need help with regarding this PDF.]`;
  } catch (error) {
    console.error("PDF file access error:", error);
    return "[PDF file uploaded - could not access file]";
  }
}

async function analyzeCSV(filepath: string): Promise<string> {
  try {
    const content = await readFile(filepath, 'utf-8');
    const lines = content.split('\n').slice(0, 50); // First 50 lines
    return `CSV Data (first 50 rows):\n${lines.join('\n')}`;
  } catch (error) {
    return "[CSV file uploaded - could not read content]";
  }
}

async function analyzeImage(filepath: string, filename: string, aiConfig: any): Promise<string> {
  try {
    // Read image as base64
    const imageBuffer = await readFile(filepath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(filename).toLowerCase();
    
    // Determine MIME type
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg', 
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    
    const mimeType = mimeTypes[ext] || 'image/jpeg';
    
    // Try vision analysis with different approaches
    let visionResult = null;
    
    // First try: Use OpenAI directly for vision (if available)
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY || aiConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // More affordable vision model
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image and describe what you see. Include objects, text, people, colors, and composition. Be detailed but concise."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        }),
      });

      if (openaiResponse.ok) {
        const result = await openaiResponse.json();
        visionResult = result.choices?.[0]?.message?.content;
      }
    } catch (openaiError) {
      console.log("OpenAI vision failed, trying platform API:", openaiError);
    }

    // Second try: Use platform API (might not support vision)
    if (!visionResult) {
      try {
        const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${aiConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: aiConfig.model,
            messages: [
              {
                role: "user",
                content: `I have uploaded an image file: ${filename}. Please provide a helpful response about image analysis capabilities and what I can do with image files.`
              }
            ],
            max_tokens: 300
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const platformResponse = result.choices?.[0]?.message?.content;
          visionResult = `Image uploaded: ${filename}\n\n${platformResponse}\n\nNote: For detailed image analysis, please describe what you see in the image and I can help you work with it.`;
        }
      } catch (platformError) {
        console.log("Platform API also failed:", platformError);
      }
    }

    return visionResult || `I can see you've uploaded an image: ${filename}. While I'm currently unable to analyze the visual content directly, I can help you with:

• Image processing and manipulation techniques
• File format conversions and optimization
• Troubleshooting image-related issues
• Explaining image metadata and specifications

Please describe what you see in the image or what you'd like to do with it, and I'll be happy to assist!`;
    
  } catch (error) {
    console.error("Image analysis error:", error);
    return `Image uploaded: ${filename}. I'm ready to help you work with this image! Please describe what you see or what you'd like to do with it.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fileInfo } = body;

    if (!fileInfo || !fileInfo.name || !fileInfo.url) {
      return NextResponse.json({ error: "File info is required" }, { status: 400 });
    }

    // Get file path
    const filename = fileInfo.url.split('/').pop();
    const filepath = path.join(process.cwd(), 'uploads', session.user.id!, filename);

    let analysis = "";
    const fileType = fileInfo.type.toLowerCase();
    const ext = path.extname(fileInfo.name).toLowerCase();

    try {
      if (fileType.startsWith('image/')) {
        // Analyze image using vision model
        const aiConfig = await getUserAIConfig(session.user.id!);
        analysis = await analyzeImage(filepath, fileInfo.name, aiConfig);
      } else if (fileType === 'text/plain' || ext === '.txt') {
        // Read text files directly
        analysis = await analyzeTextFile(filepath);
      } else if (fileType === 'text/csv' || ext === '.csv') {
        // Read CSV files with structure
        analysis = await analyzeCSV(filepath);
      } else if (fileType === 'application/pdf' || ext === '.pdf') {
        // Extract text from PDF
        analysis = await analyzePDF(filepath);
      } else if (ext === '.docx') {
        analysis = `[DOCX file uploaded: ${fileInfo.name} - content extraction not yet supported for Word documents]`;
      } else if (ext === '.xlsx') {
        analysis = `[XLSX file uploaded: ${fileInfo.name} - content extraction not yet supported for Excel files]`;
      } else {
        analysis = `[File uploaded: ${fileInfo.name} (${fileInfo.type}) - content analysis not supported for this file type]`;
      }

      return NextResponse.json({
        success: true,
        analysis,
        fileInfo
      });

    } catch (fileError) {
      console.error("File analysis error:", fileError);
      return NextResponse.json({
        success: true,
        analysis: `[File uploaded: ${fileInfo.name} - could not read file content]`,
        fileInfo
      });
    }

  } catch (error) {
    console.error("Analyze file API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze file" },
      { status: 500 }
    );
  }
}