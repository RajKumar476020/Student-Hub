import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

// GET /api/files/serve/[key] — Serve file for inline preview
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  // Sanitize key to prevent path traversal
  const safeKey = path.basename(key)
  const STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './uploads'
  const filePath = path.join(process.cwd(), STORAGE_PATH, safeKey)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const buffer = fs.readFileSync(filePath)
  const ext = safeKey.split('.').pop()?.toLowerCase() || ''
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    txt: 'text/plain',
    md: 'text/markdown',
  }
  const contentType = mimeMap[ext] || 'application/octet-stream'

  return new NextResponse(new Uint8Array(buffer) as unknown as BodyInit, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
