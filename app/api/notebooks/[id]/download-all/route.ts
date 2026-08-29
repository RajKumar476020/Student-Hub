import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs'
import { ZipArchive } from 'archiver'

const MAX_ZIP_SIZE_BYTES = 200 * 1024 * 1024 // 200 MB

// GET /api/notebooks/[id]/download-all — Streaming ZIP
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  const notebook = await prisma.notebook.findUnique({
    where: { id },
    include: {
      files: { where: { deletedAt: null } },
      collaborators: session?.user?.id
        ? { where: { userId: session.user.id, status: 'accepted' } }
        : { where: { id: 'none' } },
    },
  })

  if (!notebook) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isOwner = session?.user?.id === notebook.ownerId
  const isCollab = notebook.collaborators.length > 0

  if (notebook.visibility !== 'public' && !isOwner && !isCollab) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  if (notebook.files.length === 0) {
    return NextResponse.json({ error: 'Notebook has no files to download' }, { status: 400 })
  }

  // Check total size
  const totalSize = notebook.files.reduce((sum, f) => sum + Number(f.sizeBytes), 0)
  if (totalSize > MAX_ZIP_SIZE_BYTES) {
    return NextResponse.json({ error: 'Notebook too large to download (max 200MB)' }, { status: 400 })
  }

  const STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './uploads'

  try {
    // archiver v8 uses ESM named export ZipArchive
    const archive = new ZipArchive({ zlib: { level: 6 } })

    const chunks: Buffer[] = []
    const zipPromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('data', (chunk: Buffer) => chunks.push(chunk))
      archive.on('error', (err: Error) => reject(err))
      archive.on('end', () => resolve(Buffer.concat(chunks)))
    })

    notebook.files.forEach((file) => {
      const filePath = path.join(process.cwd(), STORAGE_PATH, file.storageKey)
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file.name })
      }
    })

    // Finalize must be awaited - it triggers the streaming
    await archive.finalize()
    const zipBuffer = await zipPromise

    if (zipBuffer.length === 0) {
      return NextResponse.json({ error: 'Failed to generate ZIP - no files found on disk' }, { status: 500 })
    }

    // Increment download count (non-critical)
    await prisma.notebook.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    }).catch(() => {})

    const zipName = `${notebook.title.replace(/[^a-z0-9]/gi, '_')}.zip`

    return new NextResponse(new Uint8Array(zipBuffer) as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('ZIP generation failed:', error)
    return NextResponse.json({ error: 'Failed to generate ZIP: ' + (error?.message || 'Unknown error') }, { status: 500 })
  }
}
