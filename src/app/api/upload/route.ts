import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureUploadDir();
    const contentType = req.headers.get('content-type') || '';

    // Handle Multipart Form Data (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const files: File[] = [];

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          files.push(value);
        }
      }

      if (files.length === 0) {
        return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
      }

      const uploadedUrls: string[] = [];

      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const ext = path.extname(originalName) || '.jpg';
        const baseName = path.basename(originalName, ext);
        const fileName = `${baseName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        fs.writeFileSync(filePath, buffer);
        uploadedUrls.push(`/uploads/${fileName}`);
      }

      return NextResponse.json({
        success: true,
        url: uploadedUrls[0],
        urls: uploadedUrls,
      });
    }

    // Handle JSON Base64 upload
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { base64Data, fileName: reqFileName } = body;

      if (!base64Data) {
        return NextResponse.json({ error: 'Missing base64Data' }, { status: 400 });
      }

      const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        // If already raw base64 or external url
        return NextResponse.json({ url: base64Data, success: true });
      }

      const mimeType = matches[1];
      const dataBuffer = Buffer.from(matches[2], 'base64');
      const ext = mimeType.includes('png')
        ? '.png'
        : mimeType.includes('webp')
        ? '.webp'
        : '.jpg';

      const fileName = `vj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const filePath = path.join(UPLOAD_DIR, fileName);

      fs.writeFileSync(filePath, dataBuffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${fileName}`,
      });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
  } catch (err: any) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
