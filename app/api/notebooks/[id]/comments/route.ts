import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { filterProfanity } from '@/lib/utils'

// GET /api/notebooks/[id]/comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const notebook = await prisma.notebook.findUnique({ where: { id } })
  if (!notebook) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (notebook.visibility !== 'public') {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    const isOwner = session.user.id === notebook.ownerId
    const isCollab = (await prisma.notebookCollaborator.count({
      where: { notebookId: id, userId: session.user.id, status: 'accepted' },
    })) > 0
    if (!isOwner && !isCollab) return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const comments = await prisma.comment.findMany({
    where: { notebookId: id, parentCommentId: null },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      replies: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      },
    },
  })

  return NextResponse.json(comments)
}

// POST /api/notebooks/[id]/comments
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Login required to comment' }, { status: 401 })

  const notebook = await prisma.notebook.findUnique({ where: { id } })
  if (!notebook) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (notebook.visibility !== 'public') {
    const isOwner = session.user.id === notebook.ownerId
    const isCollab = (await prisma.notebookCollaborator.count({
      where: { notebookId: id, userId: session.user.id, status: 'accepted' },
    })) > 0
    if (!isOwner && !isCollab) return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const { content, parentCommentId } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })
  if (content.length > 1000) return NextResponse.json({ error: 'Comment too long (max 1000 chars)' }, { status: 400 })
  if (filterProfanity(content)) return NextResponse.json({ error: 'Comment contains inappropriate content' }, { status: 400 })

  if (parentCommentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentCommentId } })
    if (!parent || parent.notebookId !== id || parent.parentCommentId !== null) {
      return NextResponse.json({ error: 'Invalid parent comment (only 1 level of replies)' }, { status: 400 })
    }
  }

  const comment = await prisma.comment.create({
    data: {
      notebookId: id,
      userId: session.user.id,
      content: content.trim(),
      parentCommentId: parentCommentId || null,
    },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  })

  // Notify notebook owner of new comment (if commenter is not the owner)
  if (session.user.id !== notebook.ownerId) {
    await prisma.notification.create({
      data: {
        userId: notebook.ownerId,
        type: 'new_comment',
        payload: {
          notebookId: id,
          notebookTitle: notebook.title,
          commentBy: (session.user as any).username || session.user.id,
          commentId: comment.id,
        },
      },
    }).catch(() => {})
  }

  return NextResponse.json(comment, { status: 201 })
}
