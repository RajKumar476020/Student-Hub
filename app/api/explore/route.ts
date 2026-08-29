import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/explore — Public notebooks feed
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sort = searchParams.get('sort') || 'recent'
  const tag = searchParams.get('tag') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 48)
  const skip = (page - 1) * limit

  const orderBy =
    sort === 'downloads'
      ? { downloadCount: 'desc' as const }
      : sort === 'views'
      ? { viewCount: 'desc' as const }
      : { updatedAt: 'desc' as const }

  const where = {
    visibility: 'public' as const,
    ...(tag ? { tag } : {}),
  }

  const [notebooks, total] = await Promise.all([
    prisma.notebook.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        tag: true,
        coverColor: true,
        viewCount: true,
        downloadCount: true,
        createdAt: true,
        updatedAt: true,
        owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        collaborators: {
          where: { status: 'accepted' },
          select: { user: { select: { id: true, avatarUrl: true } } },
          take: 5,
        },
        _count: { select: { files: { where: { deletedAt: null } }, notes: true } },
      },
    }),
    prisma.notebook.count({ where }),
  ])

  return NextResponse.json({
    notebooks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}
