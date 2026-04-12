import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    const filePath = path.join(process.cwd(), 'public', 'skills', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Read file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Determine content type
    let contentType = 'text/plain';
    if (filename.endsWith('.sh')) {
      contentType = 'application/x-sh';
    } else if (filename.endsWith('.md')) {
      contentType = 'text/markdown';
    }
    
    // Return file with appropriate headers
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving skill file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
