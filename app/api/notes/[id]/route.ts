import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function canEditNote(noteId: string, userId: string) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: {
      notebook: { include: { collaborators: { where: { userId, status: 'accepted' } } } },
    },
  })
  if (!note) return { allowed: false, note: null }
  const allowed = note.notebook.ownerId === userId || note.notebook.collaborators.length > 0
  return { allowed, note }
}

// GET /api/notes/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      notebook: true,
      creator: { select: { id: true, username: true, displayName: true } },
    },
  })
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isPublic = note.notebook.visibility === 'public'
  const isOwner = session?.user?.id === note.notebook.ownerId
  const isCollab = session?.user?.id
    ? (await prisma.notebookCollaborator.count({
        where: { notebookId: note.notebookId, userId: session.user.id, status: 'accepted' },
      })) > 0
    : false

  if (!isPublic && !isOwner && !isCollab) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  return NextResponse.json(note)
}

// PATCH /api/notes/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = await canEditNote(id, session.user.id)
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, contentMd } = await req.json()

  const note = await prisma.note.update({
    where: { id },
    data: {
      ...(title && { title: title.trim() }),
      ...(contentMd !== undefined && { contentMd }),
    },
  })

  return NextResponse.json(note)
}

// DELETE /api/notes/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = await canEditNote(id, session.user.id)
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.note.delete({ where: { id } })
  return NextResponse.json({ message: 'Note deleted' })
}
