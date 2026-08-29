import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/search?q=query&tag=tag&page=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || ''
  const tag = searchParams.get('tag') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = 20
  const skip = (page - 1) * limit

  if (!q && !tag) {
    return NextResponse.json({ notebooks: [], pagination: { page: 1, total: 0, totalPages: 0 } })
  }

  const where: any = {
    visibility: 'public',
    ...(tag ? { tag } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { tag: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [notebooks, total] = await Promise.all([
    prisma.notebook.findMany({
      where,
      orderBy: { viewCount: 'desc' },
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
        updatedAt: true,
        owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { files: { where: { deletedAt: null } } } },
      },
    }),
    prisma.notebook.count({ where }),
  ])

  return NextResponse.json({
    notebooks,
    query: q,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}
