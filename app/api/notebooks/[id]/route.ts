import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function getNotebookAccess(notebookId: string, userId?: string) {
  const notebook = await prisma.notebook.findUnique({
    where: { id: notebookId },
    include: {
      owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      collaborators: {
        include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
      },
      folders: {
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      },
      files: {
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
        select: {
          id: true, name: true, mimeType: true, sizeBytes: true,
          folderId: true, downloadCount: true, createdAt: true, updatedAt: true,
          uploader: { select: { id: true, username: true } },
        },
      },
      notes: {
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true, title: true, folderId: true, createdAt: true, updatedAt: true,
          creator: { select: { id: true, username: true } },
        },
      },
    },
  })

  if (!notebook) return { notebook: null, role: null }

  const isOwner = userId === notebook.ownerId
  const isCollaborator = notebook.collaborators.some(
    (c) => c.userId === userId && c.status === 'accepted'
  )
  const isPublic = notebook.visibility === 'public'

  if (!isOwner && !isCollaborator && !isPublic) {
    return { notebook: null, role: null }
  }

  let role: 'owner' | 'collaborator' | 'viewer' | 'guest' = 'guest'
  if (isOwner) role = 'owner'
  else if (isCollaborator) role = 'collaborator'
  else if (userId) role = 'viewer'

  return { notebook, role }
}

// GET /api/notebooks/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  const { notebook, role } = await getNotebookAccess(id, session?.user?.id)

  if (!notebook) {
    return NextResponse.json({ error: 'Notebook not found or access denied' }, { status: 404 })
  }

  // Increment view count for public notebooks (non-owner)
  if (notebook.visibility === 'public' && role !== 'owner') {
    await prisma.notebook.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {}) // Non-critical
  }

  return NextResponse.json({
    ...notebook,
    files: notebook.files.map((f) => ({
      ...f,
      sizeBytes: f.sizeBytes.toString(),
    })),
    role,
  })
}

// PATCH /api/notebooks/[id] — Update metadata (owner only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notebook = await prisma.notebook.findUnique({ where: { id } })
  if (!notebook) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (notebook.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, tag, coverColor, visibility } = await req.json()

  const updated = await prisma.notebook.update({
    where: { id },
    data: {
      ...(title && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(tag !== undefined && { tag: tag || null }),
      ...(coverColor && { coverColor }),
      ...(visibility && { visibility }),
    },
    include: {
      owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/notebooks/[id] — Owner only
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notebook = await prisma.notebook.findUnique({ where: { id } })
  if (!notebook) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (notebook.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { confirmTitle } = await req.json()
  if (confirmTitle !== notebook.title) {
    return NextResponse.json({ error: 'Confirmation title does not match' }, { status: 400 })
  }

  await prisma.notebook.delete({ where: { id } })

  return NextResponse.json({ message: 'Notebook deleted' })
}
