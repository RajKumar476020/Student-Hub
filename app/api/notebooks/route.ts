import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateUniqueSlug, NOTEBOOK_COLORS } from '@/lib/utils'

// POST /api/notebooks — Create a notebook
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, description, tag, coverColor, visibility } = await req.json()

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  if (title.length > 150) {
    return NextResponse.json({ error: 'Title too long (max 150 chars)' }, { status: 400 })
  }

  const slug = generateUniqueSlug(title, (session.user as any).username || 'user')

  const notebook = await prisma.notebook.create({
    data: {
      ownerId: session.user.id,
      title: title.trim(),
      slug,
      description: description?.trim() || null,
      tag: tag || null,
      coverColor: NOTEBOOK_COLORS.includes(coverColor) ? coverColor : NOTEBOOK_COLORS[0],
      visibility: visibility === 'public' ? 'public' : 'private',
    },
    include: {
      owner: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  })

  return NextResponse.json(notebook, { status: 201 })
}

// GET /api/notebooks — List my notebooks
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const owned = await prisma.notebook.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      owner: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      collaborators: {
        where: { status: 'accepted' },
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      },
      _count: {
        select: { files: { where: { deletedAt: null } }, folders: { where: { deletedAt: null } }, notes: true },
      },
    },
  })

  const collaborating = await prisma.notebook.findMany({
    where: {
      collaborators: {
        some: { userId: session.user.id, status: 'accepted' },
      },
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      owner: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      collaborators: {
        where: { status: 'accepted' },
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      },
      _count: {
        select: { files: { where: { deletedAt: null } }, folders: { where: { deletedAt: null } }, notes: true },
      },
    },
  })

  return NextResponse.json({ owned, collaborating })
}
