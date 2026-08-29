import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const VALID_REASONS = ['spam', 'plagiarism', 'inappropriate', 'other']

// POST /api/reports
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Login required to report' }, { status: 401 })

  const { targetType, targetId, reason, details } = await req.json()

  if (!['notebook', 'comment'].includes(targetType)) {
    return NextResponse.json({ error: 'Invalid target type' }, { status: 400 })
  }

  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
  }

  const report = await prisma.report.create({
    data: {
      targetType,
      targetId,
      reporterId: session.user.id,
      reason,
      details: details?.trim() || null,
      status: 'open',
    },
  })

  return NextResponse.json(report, { status: 201 })
}

// GET /api/reports — Admin only
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Simple admin check — set ADMIN_USER_ID in .env.local
  const adminId = process.env.ADMIN_USER_ID
  if (adminId && session.user.id !== adminId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const reports = await prisma.report.findMany({
    where: { status: 'open' },
    orderBy: { createdAt: 'desc' },
    include: {
      reporter: { select: { id: true, username: true, displayName: true } },
    },
  })

  return NextResponse.json(reports)
}
