import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function isNotebookEditor(notebookId: string, userId: string) {
  const notebook = await prisma.notebook.findUnique({
    where: { id: notebookId },
    include: { collaborators: { where: { userId, status: 'accepted' } } },
  })
  if (!notebook) return false
  return notebook.ownerId === userId || notebook.collaborators.length > 0
}

// POST /api/notebooks/[id]/notes
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const canEdit = await isNotebookEditor(id, session.user.id)
  if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, contentMd, folderId } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const note = await prisma.note.create({
    data: {
      notebookId: id,
      title: title.trim(),
      contentMd: contentMd || '',
      folderId: folderId || null,
      createdBy: session.user.id,
    },
    include: { creator: { select: { id: true, username: true } } },
  })

  return NextResponse.json(note, { status: 201 })
}
