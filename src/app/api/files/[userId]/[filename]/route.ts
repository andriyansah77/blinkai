import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getPrivySession } from "@/lib/privy-server";
interface RouteContext {
  params: { userId: string; filename: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getPrivySession(request);
    
    // Only allow users to access their own files or public files
    if (!session?.user || session.user.id !== params.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filepath = path.join(process.cwd(), 'uploads', params.userId, params.filename);
    
    try {
      const fileBuffer = await readFile(filepath);
      
      // Determine content type based on file extension
      const ext = path.extname(params.filename).toLowerCase();
      const contentTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };

      const contentType = contentTypes[ext] || 'application/octet-stream';

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${params.filename}"`,
          'Cache-Control': 'public, max-age=31536000',
        },
      });

    } catch (fileError) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}