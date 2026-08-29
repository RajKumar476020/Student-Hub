import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getFileBuffer } from '@/lib/storage'

// GET /api/files/[id]/download
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  const file = await prisma.file.findUnique({
    where: { id, deletedAt: null },
    include: { notebook: true },
  })

  if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 })

  const notebook = file.notebook
  const isOwner = session?.user?.id === notebook.ownerId
  const isCollab = session?.user?.id
    ? (await prisma.notebookCollaborator.count({
        where: { notebookId: notebook.id, userId: session.user.id, status: 'accepted' },
      })) > 0
    : false

  if (notebook.visibility !== 'public' && !isOwner && !isCollab) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Increment download count
  await prisma.file.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  })
  await prisma.notebook.update({
    where: { id: notebook.id },
    data: { downloadCount: { increment: 1 } },
  })

  const buffer = await getFileBuffer(file.storageKey)

  return new NextResponse(new Uint8Array(buffer) as unknown as BodyInit, {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
      'Content-Length': buffer.length.toString(),
    },
  })
}
