import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, password, username, displayName } = await req.json()

    if (!email || !password || !username || !displayName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json({ error: 'Username must be 3–30 characters' }, { status: 400 })
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username can only contain lowercase letters, numbers, and underscores' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })

    if (existing) {
      if (existing.email === email) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        username,
        displayName,
        passwordHash,
        emailVerified: true, // Auto-verify for now (no email service)
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        emailVerified: true,
      },
    })

    return NextResponse.json({ user, message: 'Account created successfully' }, { status: 201 })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
