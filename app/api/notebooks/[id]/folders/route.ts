import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function isNotebookEditor(notebookId: string, userId: string) {
  const notebook = await prisma.notebook.findUnique({
    where: { id: notebookId },
    include: { collaborators: { where: { userId, status: 'accepted' } } },
  })
  if (!notebook) return false
  return notebook.ownerId === userId || notebook.collaborators.length > 0
}

// POST /api/notebooks/[id]/folders
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const canEdit = await isNotebookEditor(id, session.user.id)
    if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { name, parentFolderId } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Folder name required' }, { status: 400 })

    const folder = await prisma.folder.create({
      data: {
        notebookId: id,
        name: name.trim(),
        parentFolderId: parentFolderId || null,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json(folder, { status: 201 })
  } catch (err: any) {
    console.error('Folder creation error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to create folder' }, { status: 500 })
  }
}
