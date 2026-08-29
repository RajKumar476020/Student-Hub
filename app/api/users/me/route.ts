import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      institution: true,
      emailVerified: true,
      createdAt: true,
    },
  })

  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { displayName, bio, institution, avatarUrl } = await req.json()

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(displayName && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(institution !== undefined && { institution }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      institution: true,
    },
  })

  return NextResponse.json(user)
}
