import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/comments/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { notebook: true },
  })

  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isSelf = session.user.id === comment.userId
  const isNotebookOwner = session.user.id === comment.notebook.ownerId

  if (!isSelf && !isNotebookOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.comment.update({
    where: { id },
    data: { isDeleted: true, content: '[deleted]' },
  })

  return NextResponse.json({ message: 'Comment deleted' })
}
