import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function canEditFolder(folderId: string, userId: string) {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      notebook: { include: { collaborators: { where: { userId, status: 'accepted' } } } },
    },
  })
  if (!folder) return false
  return folder.notebook.ownerId === userId || folder.notebook.collaborators.length > 0
}

// PATCH /api/folders/[id] — rename or move
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowed = await canEditFolder(id, session.user.id)
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, parentFolderId } = await req.json()

  const folder = await prisma.folder.update({
    where: { id },
    data: {
      ...(name && { name: name.trim() }),
      ...(parentFolderId !== undefined && { parentFolderId: parentFolderId || null }),
    },
  })

  return NextResponse.json(folder)
}

// DELETE /api/folders/[id] — soft delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowed = await canEditFolder(id, session.user.id)
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.folder.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: 'Folder moved to trash' })
}
