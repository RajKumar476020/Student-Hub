import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { deleteFile, getFileBuffer } from '@/lib/storage'

// DELETE /api/files/[id] — Soft delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const file = await prisma.file.findUnique({
    where: { id, deletedAt: null },
    include: { notebook: { include: { collaborators: { where: { userId: session.user.id, status: 'accepted' } } } } },
  })

  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isOwner = session.user.id === file.notebook.ownerId
  const isCollab = file.notebook.collaborators.length > 0

  if (!isOwner && !isCollab) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.file.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: 'File moved to trash' })
}

// GET /api/files/[id] — Get file info
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  const file = await prisma.file.findUnique({
    where: { id, deletedAt: null },
    include: {
      notebook: true,
      uploader: { select: { id: true, username: true, displayName: true } },
    },
  })

  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 })

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

  return NextResponse.json({ ...file, sizeBytes: file.sizeBytes.toString() })
}
