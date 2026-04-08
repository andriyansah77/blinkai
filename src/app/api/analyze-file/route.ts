import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readFile } from "fs/promises";
import path from "path";
import { getUserAIConfig } from "@/lib/platform";

// Dynamic import for pdf-parse to avoid build issues
const pdfParse = require('pdf-parse');

// File analysis utilities
async function analyzeTextFile(filepath: string): Promise<string> {
  const content = await readFile(filepath, 'utf-8');
  return content.slice(0, 10000); // Limit to 10k chars
}

async function analyzePDF(filepath: string): Promise<string> {
  try {
    const dataBuffer = await readFile(filepath);
    const data = await pdfParse(dataBuffer);
    return data.text.slice(0, 10000); // Limit to 10k chars
  } catch (error) {
    console.error("PDF parsing error:", error);
    return "[PDF file uploaded - could not extract text content]";
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
    
    // Use vision model to analyze image
    const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o", // Vision model
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this image and describe what you see in detail. Include any text, objects, people, colors, composition, and other relevant details."
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
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`Vision API failed: ${response.status}`);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || "[Image analysis failed]";
    
  } catch (error) {
    console.error("Image analysis error:", error);
    return `[Image uploaded: ${filename} - analysis failed: ${error instanceof Error ? error.message : 'unknown error'}]`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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